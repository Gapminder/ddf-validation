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
import Data.DDF.Atoms.Value
import Data.DDF.Concept (Concept, parseConcept, reservedConcepts)
import Data.DDF.Csv.CsvFile (CsvFile, parseCsvFile)
import Data.DDF.Csv.FileInfo (FileInfo, CollectionInfo(..))
import Data.DDF.Csv.FileInfo as FI
import Data.DDF.Csv.Utils (createConceptInput, createEntityInput, createPointInput)
import Data.DDF.DataPoint (PointInput, DataPointList, DataPointListInput, parseDataPointListWithValueParser)
import Data.DDF.Entity (Entity, parseEntity)
import Data.DDF.BaseDataSet (BaseDataSet(..), getValueParser)
import Data.Either (Either(..))
import Data.List.NonEmpty (NonEmptyList)
import Data.List.NonEmpty as NEL
import Data.Maybe (Maybe(..))
import Data.String as Str
import Data.String.NonEmpty.Internal (NonEmptyString(..))
import Data.String.NonEmpty as NES
import Data.Traversable (sequence, for)
import Data.Tuple (Tuple(..))
import Data.Validation.Issue (Issue(..), Issues)
import Data.Validation.Result (Messages, hasError, messageFromError, setError, setFile, setLineNo)
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
      msgs = [ messageFromError $ Issue $ "expect " <> name <> " has at least one item" ]
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
      msgs = map (setFile fp <<< messageFromError) errs

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
                msgs = map (setLineNo (getLineNo row) <<< setFile fp <<< messageFromError) errs
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
                msgs = map (setLineNo (getLineNo row) <<< setFile fp <<< messageFromError) errs
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
  msgs = map messageFromError issues

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
    -- FIXME: check constrains
    DataPoints { indicator, pkeys, constrains } -> do
      let
        vid = Id.parseId' indicator
        vpkeys = NEL.sequence1 $ Id.parseId' <$> pkeys
        idAndKeys = (Tuple <$> vid <*> vpkeys)
      case toEither idAndKeys of
        Left errs -> do
          vWarning msgs
          pure []
          where
          msgs = map messageFromError errs
        Right (Tuple indicatorId primaryKeys) -> do
          let
            func row = createPointInput fp indicatorId primaryKeys headers row

            keyParsers :: V Issues (NonEmptyList ValueParser)
            keyParsers = sequence $ map (getValueParser dataset) primaryKeys

            valueParser :: V Issues ValueParser
            valueParser = getValueParser dataset indicatorId

          points <- for csvfiles
            ( \f -> do
                let
                  rows = f.csvContent.rows
                  ptsRes = map func rows
                  { yes, no } = Arr.partition isValid ptsRes
                  toReturn = sequence yes
                  toEmit = sequence no
                case toEither toEmit of
                  Left errs -> do
                    vWarning msgs
                    pure unit
                    where
                    filepath = FI.filepath f.fileInfo
                    msgs = map (setFile filepath <<< messageFromError) errs
                  Right _ -> pure unit
                case toEither toReturn of
                  Left _ -> pure []
                  Right res -> pure res
            )
          let
            datapoints = Arr.concat $ NEA.toArray points
            datapointListInput = { indicatorId, primaryKeys, datapoints }

            res = (Tuple <$> keyParsers <*> valueParser)
              `andThen` (\(Tuple kp vp) -> parseDataPointListWithValueParser kp vp datapointListInput)
          case toEither res of
            Right dpl -> pure [ dpl ]
            Left errs -> do
              vWarning msgs
              pure []
              where
              msgs = map (setFile fp <<< messageFromError) errs
    otherwise -> pure []

-- | Warn if Csv Headers are not in concept list
validateCsvHeaders :: BaseDataSet -> CsvFile -> Validation Messages Unit
validateCsvHeaders (BaseDataSet ds) { csvContent } = do
  let
    headers = map unwrap $ csvContent.headers
    concepts = map unwrap $ HM.keys ds.concepts
    reserved = map unwrap reservedConcepts

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
            [ messageFromError
                $ Issue
                $ hstr <> " is not in concept list."
            ]
    )

  pure unit
