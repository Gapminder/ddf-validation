module Main where

import Prelude

import Control.Monad.Trans.Class (lift)
import Data.Array as Arr
import Data.Array.NonEmpty as NEA
import Data.DDF.Csv.FileInfo
  ( CollectionInfo(..)
  , FileInfo(..)
  , getCollectionFiles
  , isConceptFile
  , isEntitiesFile
  , isDataPointsFile
  )
import Data.DDF.Csv.FileInfo as FI
import Data.DDF.BaseDataSet (BaseDataSet(..), parseBaseDataSet)
import Data.Validation.Issue (Issue(..))
import Data.Validation.Result (Messages, hasError, messageFromIssue, showMessage)
import Data.Validation.ValidationT (Validation, ValidationT, runValidationT, vError, vWarning)
import Data.Either (Either(..), hush)
import Data.JSON.DataPackage (datapackageExists)
import Data.Maybe (Maybe(..), fromJust, fromMaybe, isNothing)
import Data.String (joinWith)
import Data.Tuple (Tuple(..), fst, snd)
import Data.Validation.Semigroup (V, andThen, invalid, isValid, toEither)
import Effect (Effect)
import Effect.Aff (launchAff_, Aff)
import Effect.Class (liftEffect)
import Effect.Console (log, logShow)
import Node.Path (FilePath)
import Node.Process (argv)
import Utils (getFiles)
import App.Validations
import Debug
import Data.Traversable (sequence, for)

-- testrun :: FilePath -> Effect Unit
-- testrun path = launchAff_ do
--   -- list all csv files in the folder
--   fs <- getFiles path [ ".git", "etl", "lang", "assets" ]
--   liftEffect $ log "reading file list..."
--   _ <- traceM fs
--   pure unit

validate :: FilePath -> ValidationT Messages Aff BaseDataSet
validate path = do
  _ <- lift $ liftEffect $ log "reading file list..."
  fs <- lift $ getFiles path [ ".git", "etl", "lang", "assets" ]

  let
    -- parse filenames
    -- just yield the right ones, ignore lefts
    ddfFiles = Arr.catMaybes $ map (\f -> hush $ FI.fromFilePath f) fs

  when (isNothing $ Arr.head ddfFiles)
    $ vError [ messageFromIssue $ Issue "No csv files in this folder. Please begin with a ddf--concepts.csv file." ]

  _ <- lift $ liftEffect $ log "loading concepts and entities..."

  let
    -- FIXME: not sure why I can't use compare `on` here.
    -- group files by their collection. e.g concept files / entity files
    fileGroups = Arr.groupAllBy (\a b -> compare (FI.collection a) (FI.collection b)) ddfFiles

  -- filter concept files
  -- we must have concept files in a dataset.
  conceptFiles_ <- checkNonEmptyArray "concept csvs" $
    Arr.filter (isConceptFile <<< NEA.head) fileGroups

  let
    conceptFiles = NEA.toArray $ NEA.head conceptFiles_
  -- create concepts
  conceptInputs <- lift $ sequence $ createCsvFileInput <$> conceptFiles
  conceptCsvFiles <- validateCsvFiles conceptInputs
  concepts <- for conceptCsvFiles (\x -> validateConcepts x)

  let
    entityFiles = Arr.concatMap NEA.toArray $
      Arr.filter (isEntitiesFile <<< NEA.head) fileGroups

  -- create entities
  entityInputs <- lift $ sequence $ createCsvFileInput <$> entityFiles
  entityCsvFiles <- validateCsvFiles entityInputs
  entities <- for entityCsvFiles (\x -> validateEntities x)

  -- _ <- lift $ liftEffect $ logShow $ map Ent.getIdAndFile entities
  -- create base dataset
  let
    baseDataSet = parseBaseDataSet { concepts: Arr.concat concepts, entities: Arr.concat entities }

  case toEither baseDataSet of
    Left errs -> vError $ messageFromIssue <$> errs
    Right ds@(BaseDataSet ds_) -> do
      _ <- lift $ liftEffect $ log "validating concepts and entities..."
      -- Now we have baseDataSet, we can do more checking to csvfiles and concepts/entities
      -- 1. check file headers are valid concepts
      _ <- for conceptCsvFiles (\x -> validateCsvHeaders ds x)
      _ <- for entityCsvFiles (\x -> validateCsvHeaders ds x)
      validateConceptLength ds
      -- TODO: 2. check concept and entity props values are good in their domain

      -- check datapoints, we will first group datapoint files by indicator and keys
      _ <- lift $ liftEffect $ log "validating datapoints..."
      -- _ <- lift $ liftEffect $ logShow ds_.concepts
      let
        datapointFiles = Arr.concatMap NEA.toArray $
          Arr.filter (isDataPointsFile <<< NEA.head) fileGroups
        datapointGroups = Arr.groupAllBy
          (\a b -> FI.compareDP (FI.collection a) (FI.collection b))
          datapointFiles
      _ <- for datapointGroups
        ( \files -> do
            -- read all files
            csvfileinputs <- lift $ sequence $ createCsvFileInput <$> files
            csvfiles <- validateCsvFiles $ NEA.toArray csvfileinputs
            -- _ <- lift $ liftEffect $ logShow $ csvfiles
            case NEA.fromArray csvfiles of
              Nothing -> pure unit
              Just csvfiles_ -> do
                dpl <- validateDataPoints ds csvfiles_
                -- _ <- lift $ liftEffect $ logShow dpl
                pure unit
        )
      pure ds

-- pure baseDataSet

-- TODO: I will need an other one to build the dataset from datapackage.json.

runMain :: FilePath -> Effect Unit
runMain path = launchAff_ do
  liftEffect $ log "v0.0.6"
  (Tuple msgs ds) <- runValidationT $ validate path
  let
    allmsgs = joinWith "\n" $ map showMessage msgs
  liftEffect $ log allmsgs
  case ds of
    Just ds_ -> do
      -- liftEffect $ logShow ds_
      if hasError msgs then
        liftEffect $ log "❌ Dataset is invalid"
      else
        liftEffect $ log "✅ Dataset is valid"
    Nothing -> liftEffect $ log "❌ Dataset is invalid"

-- main
main :: Effect Unit
main = do
  -- get path
  path <- argv
  case path Arr.!! 2 of
    Nothing -> runMain "./"
    Just fp -> runMain fp
