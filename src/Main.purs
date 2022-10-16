module Main where

import Prelude
import Control.Monad.State.Trans (get)
import Control.Monad.Trans.Class (lift)
import Data.Array (concat, filter, foldM, partition)
import Data.Array as A
import Data.Array as Arr
import Data.Array.NonEmpty (NonEmptyArray, groupAllBy, groupBy)
import Data.Csv (CsvRow(..), RawCsvContent, getLineNo, getRow, readCsv)
import Data.Csv as C
import Data.DDF.Concept (Concept(..), parseConcept)
import Data.DDF.Concept as Conc
import Data.DDF.CsvFile (CsvContent, CsvFile(..), Header(..), getCsvContent, validCsvFile)
import Data.DDF.CsvFile as CSV
import Data.DDF.DataSet (DataSet(..))
import Data.DDF.DataSet as DataSet
import Data.DDF.Entity as Ent
import Data.DDF.FileInfo (CollectionInfo(..), FileInfo(..), getCollectionFiles, isConceptFile)
import Data.DDF.FileInfo as FI
import Data.DDF.Validation.Result (Error(..), Errors, Messages, hasError, messageFromError, setError, setFile, setLineNo, setSuggestions)
import Data.DDF.Validation.ValidationT (Validation, ValidationT(..), runValidationT, vError, vWarning)
import Data.Either (Either(..))
import Data.Foldable (traverse_)
import Data.JSON.DataPackage (datapackageExists)
import Data.List (List(..))
import Data.List as L
import Data.Map (Map)
import Data.Map as Map
import Data.Maybe (Maybe(..))
import Data.String (joinWith)
import Data.String.NonEmpty.Internal (NonEmptyString(..))
import Data.Traversable (for, sequence, traverse)
import Data.Tuple (Tuple(..), fst, snd)
import Data.Validation.Semigroup (V, andThen, invalid, isValid, toEither)
import Effect (Effect)
import Effect.Aff (launchAff_)
import Effect.Console (log, logShow)
import Node.Path (FilePath)
import Node.Process (argv)
import Utils (arrayOfLeft, arrayOfRight, getFiles)

-- TODO: move below functions to separated module.
parseFileInfos :: Array FilePath -> Validation Messages (Array FileInfo)
parseFileInfos fps = do
  fis <-
    for fps
      $ \fp -> do
          let
            res = toEither $ FI.validateFileInfo fp
          case res of
            Right x -> pure [ x ]
            Left errs -> do
              let
                msgs = map (setFile fp <<< messageFromError) errs
              vWarning msgs
              pure []
  pure $ A.concat fis

-- FIXME: parse concept file and parse entity file should be different
-- because when parsing entity file, we can check if all headers are valid id in dataset.
parseCsvFiles :: Array (Tuple FileInfo RawCsvContent) -> Validation Messages (Array CsvFile)
parseCsvFiles inputs = do
  fs <-
    for inputs
      $ \(Tuple f r) -> do
          let
            fp = FI.filepath f
          case toEither $ CSV.validCsvFile f r of
            Right x -> pure [ x ]
            Left errs -> do
              let
                msgs = map (setFile fp <<< messageFromError) errs
              vWarning msgs
              pure []
  pure $ A.concat fs

appendCsv :: CsvFile -> DataSet -> Validation Messages DataSet
appendCsv csv dataset = case FI.collection $ CSV.getFileInfo csv of
  Concepts -> appendConceptsCsv csv dataset
  Entities ent -> appendEntityCsv ent csv dataset
  otherwise -> vError $ map messageFromError [ Error $ "not implemented" ]

appendConceptsCsv :: CsvFile -> DataSet -> Validation Messages DataSet
appendConceptsCsv csv dataset = foldM (\d r -> run headers d r) dataset rows
  where
  { headers, rows } = CSV.getCsvContent csv

  fp = FI.filepath $ CSV.getFileInfo csv

  validateConceptCsvErrors hs csvrow =
    CSV.validCsvRec hs csvrow
      `andThen`
        (pure <<< Conc.conceptInputFromCsvRec)
      `andThen`
        Conc.parseConcept

  run hs ds csvrow@(CsvRow (Tuple idx row)) = do
    let
      concept = validateConceptCsvErrors hs csvrow

      mkMessage = setFile fp <<< setLineNo (idx + 1) <<< messageFromError
    case toEither concept of
      Left errs -> do
        let
          msgs = map (setError <<< mkMessage) errs
        vWarning msgs
        pure ds
      Right conc -> do
        case toEither $ Conc.conceptIdTooLong conc of
          Left errs' -> do
            let
              msgs = map mkMessage errs'
            vWarning msgs
          Right _ -> pure unit
        case toEither $ DataSet.addConcept conc ds of
          Left errs' -> do
            let
              msgs = map (setError <<< mkMessage) errs'
            vWarning msgs
            pure ds
          Right newds -> pure newds

appendEntityCsv :: FI.Ent -> CsvFile -> DataSet -> Validation Messages DataSet
appendEntityCsv { domain, set } csv dataset = foldM (\d r -> run headers d r) dataset rows
  where
  { headers, rows } = CSV.getCsvContent csv

  fp = FI.filepath $ CSV.getFileInfo csv

  run hs ds csvrow@(CsvRow (Tuple idx row)) = do
    let
      entity =
        CSV.validCsvRec hs csvrow
          `andThen`
            Ent.entityInputFromCsvRecAndFileInfo { domain, set }
          `andThen`
            Ent.parseEntity
    case toEither entity of
      Left errs -> do
        let
          msgs = map (setError <<< setFile fp <<< setLineNo (idx + 1) <<< messageFromError) errs
        vWarning msgs
        pure ds
      Right ent -> do
        case toEither $ DataSet.addEntity ent ds of
          Left errs' -> do
            let
              msgs = map (setError <<< setFile fp <<< setLineNo (idx + 1) <<< messageFromError) errs'
            vWarning msgs
            pure ds
          Right newds -> pure newds

checkDataSetConceptErrors :: DataSet -> Validation Messages DataSet
checkDataSetConceptErrors ds = do
  let
    res = DataSet.checkDomainForEntitySets ds
  case toEither res of
    Left errs -> do
      let
        -- FIXME: how to get the file and line num when running dataset checking?
        -- one way to do is to first read concepts csvs and then read it again for such checking.
        -- the other way is to cache where the concepts are defined.
        msgs = map (setError <<< messageFromError) errs
      vWarning msgs
      pure ds
    Right _ -> pure ds

runMain :: FilePath -> Effect Unit
runMain fp = do
  -- check if datapackage exists
  datapackageFile <- datapackageExists fp
  case toEither datapackageFile of
    Left errs -> do
      let
        msgs = map (setFile fp <<< messageFromError) errs
      log $ joinWith "\n" $ map show msgs
      log "❌ Dataset is invalid"
    Right _ -> do
      -- load all files
      files <- getFiles fp [ ".git", "etl", "lang", "assets" ]
      (Tuple msgs ds) <-
        runValidationT
          $ do
              fileInfos <- parseFileInfos files
              when (A.length fileInfos == 0)
                $ vError [ messageFromError $ Error "No csv files in this folder. Please begin with a ddf--concepts.csv file." ]
              -- validate Concept files
              let
                conceptFiles = getCollectionFiles "concepts" fileInfos
              when (A.length conceptFiles == 0)
                $ vError [ messageFromError $ Error "No concepts csv files in this folder. Dataset must at least have a ddf--concepts.csv file." ]
              conceptCsvContents <- lift $ C.readCsvs $ map FI.filepath conceptFiles
              let
                conceptInputs = A.zip conceptFiles conceptCsvContents
              conceptCsvFiles <- parseCsvFiles conceptInputs
              -- create a dataset and append all Concepts parsed
              ds <- foldM (\d f -> appendCsv f d) DataSet.empty conceptCsvFiles
              -- TODO: after loading all concepts, need to check if all properties keys are valid Concepts
              dsWithConc <- checkDataSetConceptErrors ds
              -- validate Entity files
              let
                entityFiles = getCollectionFiles "entities" fileInfos
              entityCsvContents <- lift $ C.readCsvs $ map FI.filepath entityFiles
              let
                entityInputs = A.zip entityFiles entityCsvContents
              entityCsvFiles <- parseCsvFiles entityInputs
              dsWithEnt <- foldM (\d f -> appendCsv f d) dsWithConc entityCsvFiles
              -- next steps...
              -- finally if everything goes well, return the dataset
              pure dsWithEnt
      -- show all the error messages
      log $ joinWith "\n" $ map show msgs
      case ds of
        Just _ ->
          if hasError msgs then
            log "❌ Dataset is invalid"
          else
            log "✅ Dataset is valid"
        Nothing -> log "❌ Dataset is invalid"
      pure unit

-- logShow conceptFiles
main :: Effect Unit
main = do
  -- get path
  path <- argv
  case path A.!! 2 of
    Nothing -> runMain "./"
    Just fp -> runMain fp
