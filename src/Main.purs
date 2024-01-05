module Main where

import Prelude

import Control.Monad.Trans.Class (lift)
import Data.Array as Arr
import Data.Array.NonEmpty (NonEmptyArray, groupAllBy, groupBy)
import Data.Csv (CsvRow(..), RawCsvContent, getLineNo, getRow, readCsv)
import Data.Csv as C
import Data.DDF.Concept (Concept(..), parseConcept)
import Data.DDF.Concept as Conc
import Data.DDF.Atoms.Header (Header(..))
import Data.DDF.Csv.CsvFile
  ( CsvContent
  , CsvFile(..)
  , parseCsvFile
  )
import Data.DDF.Csv.CsvFile as CSV
import Data.DDF.Csv.FileInfo
  ( CollectionInfo(..)
  , FileInfo(..)
  , getCollectionFiles
  , isConceptFile
  , isEntitiesFile
  , isDataPointsFile
  )
import Data.DDF.Csv.Utils
import Data.DDF.Csv.FileInfo as FI
import Data.DDF.DataPoint (DataPoint, parseDataPoint)
import Data.DDF.BaseDataSet as DS
import Data.DDF.BaseDataSet (BaseDataSet, parseBaseDataSet)
import Data.DDF.Entity as Ent
import Data.DDF.Entity (Entity)
import Data.Validation.Issue (Issue(..), Issues)
import Data.Validation.Result (Messages, hasError, messageFromError, setError, setFile, setLineNo)
import Data.Validation.ValidationT (Validation, ValidationT, runValidationT, vError, vWarning)
import Data.Either (Either(..))
import Data.JSON.DataPackage (datapackageExists)
import Data.List (List(..))
import Data.List as L
import Data.Map (Map)
import Data.Map as Map
import Data.Maybe (Maybe(..), fromJust, fromMaybe, isNothing)
import Data.String (joinWith)
import Data.String.NonEmpty.Internal (NonEmptyString(..))
import Data.Tuple (Tuple(..), fst, snd)
import Data.Validation.Semigroup (V, andThen, invalid, isValid, toEither)
import Effect (Effect)
import Effect.Aff (launchAff_, Aff)
import Effect.Class (liftEffect)
import Effect.Console (log, logShow)
import Node.Path (FilePath)
import Node.Process (argv)
import Utils (arrayOfLeft, arrayOfRight, getFiles)
import Pipes hiding (discard)
import Pipes.Core (Producer, Producer_, Pipe, runEffect)
import Pipes.Prelude as P
import App.Validations


-- | main entry point for validation
-- This one checks all files and build the dataset
validate :: FilePath -> Aff (Tuple Messages (Maybe (List DataPoint)))
validate path = do
  -- list all csv files in the folder
  fs <- getFiles path [ ".git", "etl", "lang", "assets" ]

  runValidationT do
    let
      -- parse filenames
      ddfFiles =
        for (each fs)
          ( \f ->
              -- just yield the right ones, ignore lefts
              yield $ arrayOfRight $ FI.fromFilePath f
          )
          >-> P.concat
    whenM (isNothing <$> P.head ddfFiles)
      $ vError [ messageFromError $ Issue "No csv files in this folder. Please begin with a ddf--concepts.csv file." ]
    let
      -- filter concept / entity files
      conceptFiles = ddfFiles >-> P.filter (isConceptFile)
      entityFiles = ddfFiles >-> P.filter (isEntitiesFile)
      -- TODO: filter other files...

      -- get valid concepts from each file.
      validConcepts =
        conceptFiles
          >-> P.mapM
            ( \fi -> do
                csvRows <- liftEffect $ (readCsv $ FI.filepath fi)
                pure $ Tuple fi csvRows
            )
          >-> validateCsvFile -- check filename vs headers.
          >-> validateConcepts -- generate concept object from each row.
      -- get valid entities from each file.
      validEntities =
        entityFiles
          >-> P.mapM
            ( \fi -> do
                csvRows <- liftEffect $ (readCsv $ FI.filepath fi)
                pure $ Tuple fi csvRows
            )
          >-> validateCsvFile -- check filename vs headers
          >-> validateEntities -- generate entity object from each row.

    -- now we can create a BaseDataSet which contains all concepts and entities
    -- so that we can use to validate datapoints and others
    conceptList <- P.toListM validConcepts
    entityList <- P.toListM validEntities

    let
      baseDataSetV = parseBaseDataSet { concepts: conceptList, entities: entityList }

    case toEither baseDataSetV of
      Left errs -> vError $ map (setError <<< messageFromError) errs
      Right baseDataSet -> do
        -- validate datapoints with baseDataset
        let
          datapointFiles = ddfFiles >-> P.filter (isDataPointsFile)

          validDPs =
            datapointFiles
              >-> P.mapM
                ( \fi -> do
                    csvRows <- liftEffect $ (readCsv $ FI.filepath fi)
                    pure $ Tuple fi csvRows
                )
              >-> validateCsvFile -- check filename vs headers
              >-> validateDataPoint
        dpList <- P.toListM validDPs
        pure dpList

-- TODO: I will need an other one to build the dataset from datapackage.json.

runMain :: FilePath -> Effect Unit
runMain path = launchAff_ do
  (Tuple msgs ds) <- validate path
  let
    allmsgs = joinWith "\n" $ map show msgs
  liftEffect $ log allmsgs
  case ds of
    Just ds_ -> do
      liftEffect $ logShow ds_
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
