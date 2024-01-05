-- | Validation Pipeline

module App.Validations where

import Prelude
import Data.Validation.Issue (Issue(..), Issues)
import Data.Validation.Result (Messages, hasError, messageFromError, setError, setFile, setLineNo)
import Data.Validation.ValidationT (Validation, ValidationT(..), runValidationT, vError, vWarning)
import Data.Csv as C
import Data.Csv (CsvRow(..), RawCsvContent, getLineNo, getRow, readCsv)
import Data.DDF.Csv.CsvFile (CsvFile, parseCsvFile)
import Data.DDF.Concept (Concept, parseConcept)
import Data.DDF.Entity (Entity, parseEntity)
import Data.DDF.DataPoint (DataPoint, parseDataPoint)
import Data.DDF.Csv.FileInfo (FileInfo, CollectionInfo(..))
import Data.DDF.Csv.FileInfo as FI
import Data.DDF.Csv.Utils (createConceptInput, createEntityInput, createDataPointInput)
import Pipes.Core (Pipe)
import Pipes (yield, await, for, each)
import Data.Validation.Semigroup (V, isValid, andThen, toEither)
import Data.Either (Either(..))
import Control.Monad.Trans.Class (lift)
import Data.Tuple (Tuple(..))
import Effect.Class (liftEffect, class MonadEffect)
import Effect.Console (log, logShow)

-- |
validateCsvFile
  :: forall m
   . MonadEffect m
  => Pipe (Tuple FileInfo (Array (Array String))) CsvFile (ValidationT Messages m) Unit
validateCsvFile = do
  (Tuple fi csvRows) <- await
  let
    fp = FI.filepath fi
    rawCsvContent = C.create csvRows
    input =
      { fileInfo: fi
      , csvContent: rawCsvContent
      }
  case toEither $ parseCsvFile input of
    Right validFile -> yield validFile
    Left errs -> do
      _ <- liftEffect (log "testing")
      _ <- lift $ vWarning msgs -- not valid but we just keep the validation going
      pure unit
      where
      msgs = map (setFile fp <<< messageFromError) errs


-- | convert concept csv file to list of concepts
validateConcepts :: forall m. Monad m => Pipe CsvFile Concept (ValidationT Messages m) Unit
validateConcepts = do
  csvfile <- await
  let
    csvContent = csvfile.csvContent
    fileInfo = csvfile.fileInfo
    fp = FI.filepath fileInfo
    headers = csvContent.headers
    rows = csvContent.rows

  case FI.collection fileInfo of
    Concepts ->
      for (each rows)
        ( \row -> do
            let
              concept = createConceptInput fp headers row
                `andThen`
                  parseConcept
            case toEither concept of
              Left errs -> do
                _ <- lift $ vWarning msgs
                pure unit
                where
                msgs = map (setLineNo (getLineNo row) <<< setFile fp <<< messageFromError) errs
              Right vconc -> yield vconc
        )
    otherwise -> pure unit

-- | convert entity csv file to list of entities
validateEntities :: forall m. Monad m => Pipe CsvFile Entity (ValidationT Messages m) Unit
validateEntities = do
  csvfile <- await
  let
    csvContent = csvfile.csvContent
    fileInfo = csvfile.fileInfo
    fp = FI.filepath fileInfo
    headers = csvContent.headers
    rows = csvContent.rows

  case FI.collection fileInfo of
    Entities ent ->
      for (each rows)
        ( \row -> do
            let
              entity = createEntityInput fp ent headers row
                `andThen`
                  parseEntity
            case toEither entity of
              Left errs -> do
                _ <- lift $ vWarning msgs
                pure unit
                where
                msgs = map (setLineNo (getLineNo row) <<< setFile fp <<< messageFromError) errs
              Right vent -> yield vent
        )
    otherwise -> pure unit

-- | convert datapoint csv file to list of datapoint
validateDataPoint :: forall m. Monad m => Pipe CsvFile DataPoint (ValidationT Messages m) Unit
validateDataPoint = do
  csvfile <- await
  let
    csvContent = csvfile.csvContent
    fileInfo = csvfile.fileInfo
    fp = FI.filepath fileInfo
    headers = csvContent.headers
    rows = csvContent.rows

  case FI.collection fileInfo of
    DataPoints dp ->
      for (each rows)
        ( \row -> do
            let
              datapoint = createDataPointInput fp dp headers row
                `andThen`
                  parseDataPoint
            case toEither datapoint of
              Left errs -> do
                _ <- lift $ vWarning msgs
                pure unit
                where
                msgs = map (setLineNo (getLineNo row) <<< setFile fp <<< messageFromError) errs
              Right vdp -> yield vdp
        )
    otherwise -> pure unit
