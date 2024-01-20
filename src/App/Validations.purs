-- | Validation Pipeline

module App.Validations where

import Debug
import Prelude

import Control.Monad.Trans.Class (lift)
import Data.HashMap as HM
import Data.Array as Arr
import Data.Array.NonEmpty as NEA
import Data.Array.NonEmpty (NonEmptyArray)
import Data.Csv (CsvRow(..), RawCsvContent, getLineNo, getRow, readCsv)
import Data.Csv as C
import Data.DDF.Atoms.Identifier (Identifier)
import Data.DDF.Atoms.Identifier as Id
import Data.DDF.Atoms.Header (Header)
import Data.DDF.Atoms.Value
import Data.DDF.Concept (Concept, parseConcept, reservedConcepts, getId, getInfo)
import Data.DDF.Csv.CsvFile (CsvFile, parseCsvFile)
import Data.DDF.Csv.FileInfo (FileInfo, CollectionInfo(..))
import Data.DDF.Csv.FileInfo as FI
import Data.DDF.Csv.Utils (createConceptInput, createEntityInput, createPointInput)
import Data.DDF.DataPoint (Point, PointInput, DataPointList, DataPointListInput, parseDataPointList, parseDataPointWithValueParser)
import Data.DDF.Entity (Entity, parseEntity)
import Data.DDF.BaseDataSet (BaseDataSet(..), getValueParser, getConceptIds, updateValueParserWithConstrain)
import Data.Either (Either(..))
import Data.List.NonEmpty (NonEmptyList)
import Data.List.NonEmpty as NEL
import Data.Maybe (Maybe(..))
import Data.String as Str
import Data.String.NonEmpty.Internal (NonEmptyString(..))
import Data.String.NonEmpty as NES
import Data.Traversable (sequence, for)
import Data.Tuple (Tuple(..))
import Data.Validation.Issue (Issue(..), Issues, withRowInfo)
import Data.Validation.Result (Messages, hasError, messageFromIssue, setError, setFile, setLineNo)
import Data.Validation.Semigroup (V, isValid, andThen, toEither, invalid, validation)
import Data.Validation.ValidationT (Validation, ValidationT(..), runValidationT, vError, vWarning)
import Effect.Aff (Aff)
import Effect.Aff.Class (liftAff)
import Effect.Class (liftEffect, class MonadEffect)
import Effect.Console (log, logShow)
import Data.Newtype (unwrap)
import Debug

-- readCsvFile :: Pipe FileInfo (Tuple FileInfo (Array (Array String))) Aff Unit
-- readCsvFile = do
--   fi <- await
--   csvRows <- lift <<< C.readCsv $ FI.filepath fi
--   yield $ Tuple fi csvRows

checkNonEmptyArray :: forall a. String -> Array a -> Validation Messages (NonEmptyArray a)
checkNonEmptyArray name xs =
  case NEA.fromArray xs of
    Nothing ->
      vError msgs
      where
      msgs = [ messageFromIssue $ Issue $ "expect " <> name <> " has at least one item" ]
    Just xs_ ->
      pure xs_

createCsvFileInput :: FileInfo -> Aff (Tuple FileInfo (Array (Array String)))
createCsvFileInput fi = do
  csvRows <- readCsv $ FI.filepath fi
  pure $ Tuple fi csvRows

-- | parse csv file info and csv data into a valid CsvFile
validateCsvFile :: (Tuple FileInfo (Array (Array String))) -> Validation Messages (Array CsvFile)
validateCsvFile (Tuple fi csvRows) = do
  let
    fp = FI.filepath fi
    rawCsvContent = C.create csvRows
    input =
      { fileInfo: fi
      , csvContent: rawCsvContent
      }
  case toEither $ parseCsvFile input of
    Right validFile -> pure $ [ validFile ]
    Left errs -> do
      vWarning msgs -- not valid but we just keep the validation going
      pure $ []
      where
      msgs = map (setFile fp <<< messageFromIssue) errs

validateCsvFiles :: (Array (Tuple FileInfo (Array (Array String)))) -> Validation Messages (Array CsvFile)
validateCsvFiles xs = do
  rs <- for xs (\x -> validateCsvFile x)
  pure $ Arr.concat rs

-- | parse a CsvFile, create an array of valid concepts
validateConcepts :: CsvFile -> Validation Messages (Array Concept)
validateConcepts csvfile = do
  let
    csvContent = csvfile.csvContent
    fileInfo = csvfile.fileInfo
    fp = FI.filepath fileInfo
    headers = csvContent.headers
    rows = csvContent.rows

  case FI.collection fileInfo of
    Concepts ->
      Arr.foldM
        ( \acc row -> do
            let
              concept = createConceptInput fp headers row
                `andThen`
                  parseConcept
            case toEither concept of
              Left errs -> do
                _ <- vWarning msgs
                pure acc
                where
                msgs = map
                  ( setLineNo (getLineNo row)
                      <<< setFile fp
                      <<< setError
                      <<< messageFromIssue
                  )
                  errs
              Right vconc -> pure $ Arr.cons vconc acc
        )
        []
        rows
    otherwise -> pure []

validateEntities :: CsvFile -> Validation Messages (Array Entity)
validateEntities csvfile = do
  let
    csvContent = csvfile.csvContent
    fileInfo = csvfile.fileInfo
    fp = FI.filepath fileInfo
    headers = csvContent.headers
    rows = csvContent.rows

  case FI.collection fileInfo of
    Entities ent ->
      Arr.foldM
        ( \acc row -> do
            let
              entity = createEntityInput fp ent headers row
                `andThen`
                  parseEntity
            case toEither entity of
              Left errs -> do
                _ <- vWarning msgs
                pure acc
                where
                msgs = map
                  ( setLineNo (getLineNo row)
                      <<< setFile fp
                      <<< setError
                      <<< messageFromIssue
                  )
                  errs
              Right vent -> pure $ Arr.cons vent acc
        )
        []
        rows
    otherwise -> pure []

emitWarnings :: forall m. Monad m => Issues -> ValidationT Messages m Unit
emitWarnings issues = do
  vWarning msgs
  pure unit
  where
  msgs = map messageFromIssue issues

validateOneDataPointFile
  :: NonEmptyArray Header
  -> V Issues Identifier
  -> V Issues (NonEmptyList Identifier)
  -> V Issues (NonEmptyList ValueParser)
  -> V Issues ValueParser
  -> CsvFile
  -> V Issues (Array Point)
validateOneDataPointFile headers indicatorId pKeys keyParsers valueParser csvfile =
  let
    rows = csvfile.csvContent.rows
    collection = FI.collection csvfile.fileInfo
    fp = FI.filepath csvfile.fileInfo

    updatedKparsers :: V Issues (NonEmptyList ValueParser)
    updatedKparsers = keyParsers
      `andThen`
        ( \kp -> pure $
            updateValueParserWithConstrain kp collection
        )

    func indicator pk kp vp row = createPointInput fp indicator pk headers row
      `andThen`
        ( \input -> case input._info of
            Nothing -> parseDataPointWithValueParser kp vp input
            Just info -> withRowInfo info.filepath info.row $
              parseDataPointWithValueParser kp vp input
        )
  in
    case
      toEither
        ( func
            <$> indicatorId
            <*> pKeys
            <*> updatedKparsers
            <*> valueParser
        )
      of
      Right f -> sequence $ map f rows
      Left issues -> invalid issues

validateDataPoints
  :: BaseDataSet
  -> NonEmptyArray CsvFile
  -> Validation Messages (Array DataPointList)
validateDataPoints dataset csvfiles = do
  let
    csvfile = NEA.head csvfiles
    csvContent = csvfile.csvContent
    fileInfo = csvfile.fileInfo
    fp = FI.filepath fileInfo
    -- Assume that all csv have same headers. If the input is not like that this function will not work.
    headers = csvContent.headers

  case FI.collection fileInfo of
    DataPoints { indicator, pkeys, constrains } -> do
      let
        vid = Id.parseId' indicator
        vpkeys = NEL.sequence1 $ Id.parseId' <$> pkeys

        keyParsers :: V Issues (NonEmptyList ValueParser)
        keyParsers = vpkeys
          `andThen` (\k -> sequence $ map (getValueParser dataset) k)

        valueParser :: V Issues ValueParser
        valueParser = vid
          `andThen` getValueParser dataset
      -- TODO: clean up the code
      points <- for csvfiles
        ( \f -> do
            let
              ptsRes =
                validateOneDataPointFile
                  headers
                  vid
                  vpkeys
                  keyParsers
                  valueParser
                  f
            case toEither ptsRes of
              Right pts -> pure pts
              Left errs -> do
                case errs Arr.!! 101 of
                  Just _ ->
                    let
                      msgs = map (setError <<< messageFromIssue) $
                        Arr.take 100 errs
                      msgEnd =
                        [ (setFile fp <<< setError <<< messageFromIssue) $
                            Issue "too many issues detected, please fix and check again."
                        ]
                    in
                      do
                        vWarning msgs
                        vWarning msgEnd
                        pure []
                  Nothing -> do
                    vWarning msgs
                    pure []
                    where
                    msgs = map (setError <<< messageFromIssue) errs
        )
      let
        createInput = { indicatorId: _, primaryKeys: _, datapoints: _ }

        res =
          ( createInput
              <$> vid
              <*> vpkeys
              <*> pure (Arr.concat $ NEA.toArray points)
          )
            `andThen`
              (\input -> parseDataPointList input)
      case toEither res of
        Right dpl -> pure [ dpl ]
        Left errs -> do
          vWarning msgs
          pure []
          where
          msgs = map (setError <<< messageFromIssue) errs
    otherwise -> pure []

-- | Warn if Csv Headers are not in concept list
validateCsvHeaders :: BaseDataSet -> CsvFile -> Validation Messages Unit
validateCsvHeaders (BaseDataSet ds) { csvContent, fileInfo } = do
  let
    headers = map unwrap $ csvContent.headers
    concepts = map unwrap $ HM.keys ds.concepts
    reserved = map unwrap reservedConcepts
    filepath = FI.filepath fileInfo

  _ <- for headers
    ( \h -> do
        let
          hstr = NES.toString h
          predicate = (Str.take 4 hstr == "is--")
            || (h `Arr.elem` reserved)
            || (h `Arr.elem` concepts)
        when (not predicate)
          $ vWarning
          $
            [ setFile filepath <<< messageFromIssue
                $ Issue
                $ hstr <> " is not in concept list but it's in the header."
            ]
    )
  pure unit

-- | Warn if concept length is longer then 64 chars
validateConceptLength :: BaseDataSet -> Validation Messages Unit
validateConceptLength (BaseDataSet ds) = do
  let
    concepts = HM.values ds.concepts
    check concept =
      case getInfo concept of
        Just { filepath, row } -> withRowInfo filepath row
          $ Id.isLongerThan64Chars
          $ getId concept
        Nothing -> Id.isLongerThan64Chars $ getId concept
    res = sequence $ map check concepts

  case toEither res of
    Left errs -> do
      vWarning msgs
      where
      msgs = map messageFromIssue errs
    Right _ -> pure unit
