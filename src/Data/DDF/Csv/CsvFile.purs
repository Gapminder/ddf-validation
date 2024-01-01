-- | A good ddf csv file should have consistency in its headers and filename
module Data.DDF.Csv.CsvFile where

import Prelude
import StringParser

import Control.Alt ((<|>))
import Data.Array as A
import Data.Array.NonEmpty (NonEmptyArray, nub)
import Data.Array.NonEmpty as Narr
import Data.Array.NonEmpty.Internal (NonEmptyArray(..))
import Data.Csv (CsvRow(..), RawCsvContent)
import Data.DDF.Atoms.Identifier (Identifier)
import Data.DDF.Atoms.Identifier as Id
import Data.DDF.Csv.FileInfo (CollectionInfo(..), FileInfo(..))
import Data.DDF.Csv.FileInfo as FileInfo
import Data.Validation.Issue (Issue(..), Issues)
import Data.Validation.ValidationT (Validation, vError, vWarning)
import Data.Either (Either(..), fromLeft, fromRight, isLeft)
import Data.Generic.Rep (class Generic)
import Data.Map (Map(..))
import Data.Map as Map
import Data.Maybe (Maybe(..))
import Data.Newtype (class Newtype, unwrap)
import Data.Set as S
import Data.Show.Generic (genericShow)
import Data.String.NonEmpty (join1With, toString)
import Data.String.NonEmpty.Internal (NonEmptyString(..))
import Data.String.Utils (startsWith)
import Data.Traversable (class Foldable, sequence, traverse)
import Data.Tuple (Tuple(..), fst, snd)
import Data.Validation.Semigroup (V, andThen, invalid, isValid, toEither)
import StringParser (Parser, choice, eof, runParser, string)
import Data.DDF.Atoms.Header (parseHeader, createHeader, Header, headerVal)


-- | CsvContent is the data read from a csv file.
type CsvContent
  = { headers :: NonEmptyArray Header  -- must have header
    , rows :: Array CsvRow             -- can be empty
    }

-- | csv file combines file name info and file content
data CsvFile
  = CsvFile
    { fileInfo :: FileInfo
    , csvContent :: CsvContent
    }

instance showCsvFile :: Show CsvFile where
  show (CsvFile x) = show x

-- getters / setters
mkCsvContent :: NonEmptyArray Header -> Array CsvRow -> CsvContent
mkCsvContent headers rows = { headers: headers, rows: rows }

mkCsvFile :: FileInfo -> CsvContent -> CsvFile
mkCsvFile fi csv = CsvFile { fileInfo: fi, csvContent: csv }

getCsvContent :: CsvFile -> CsvContent
getCsvContent (CsvFile { csvContent }) = csvContent

getFileInfo :: CsvFile -> FileInfo
getFileInfo (CsvFile { fileInfo }) = fileInfo

-- Validation: Errors
-- | input data
type CsvFileInput =
  { fileInfo :: FileInfo
  , csvContent :: RawCsvContent
  }

-- | intermediate type for validating csv content
type NonEmptyRawCsvContent
  = { headers :: NonEmptyArray String
    , rows :: Array CsvRow
    }

-- | function that checks if first list is subset of second list
-- use this to check if required columns are existed.
hasCols :: forall t a. Foldable t => Ord a => Eq a => t a -> t a -> Boolean
hasCols expected actual =
  let
    expectedSet = S.fromFoldable expected

    actualSet = S.fromFoldable actual
  in
    S.subset expectedSet actualSet


-- | check if csv file has headers
notEmptyCsv :: RawCsvContent -> V Issues NonEmptyRawCsvContent
notEmptyCsv input = case join $ Narr.fromArray <$> input.headers of
  Nothing -> invalid [ InvalidCSV "no headers" ]
  Just hs -> case input.rows of
    Nothing -> pure $ { headers: hs, rows: [] }
    Just rs -> pure $ { headers: hs, rows: rs }


-- | check all columns are valid identifiers
colsAreValidIds :: NonEmptyRawCsvContent -> V Issues CsvContent
colsAreValidIds input =
  let
    res = sequence $ map parseHeader input.headers
  in
    case toEither res of
      Right hs ->
        let
          headerValues = map headerVal hs

          is_headers = Narr.filter (startsWith "is--" <<< toString) headerValues
        in
          case is_headers of
            [] -> pure $ input { headers = hs }
            xs -> invalid [ InvalidCSV $ "these headers are not valid Ids: " <> show xs ]
      Left errs -> invalid errs


-- | check all columns are valid headers (including is-- headers)
colsAreValidHeaders :: NonEmptyRawCsvContent -> V Issues CsvContent
colsAreValidHeaders input =
  let
    res = sequence $ map parseHeader input.headers
  in
    case toEither res of
      Right hs -> pure $ input { headers = hs }
      Left errs -> invalid errs


-- | check required headers
headersExists :: Array String -> NonEmptyRawCsvContent -> V Issues NonEmptyRawCsvContent
headersExists expected csvcontent =
  let
    -- requiredFields = A.fromFoldable expected
    actual = A.fromFoldable csvcontent.headers
  in
    if hasCols expected actual then
      pure csvcontent
    else
      invalid [ InvalidCSV $ "file MUST have following field: " <> show expected ]

-- | check if one and only one of the headers exists
oneOfHeaderExists :: Array String -> NonEmptyRawCsvContent -> V Issues NonEmptyRawCsvContent
oneOfHeaderExists expected csvcontent =
  let
    actual = A.fromFoldable csvcontent.headers

    -- use XOR operator
    xor true false = true

    xor false true = true

    xor _ _ = false

    res = A.foldr (\x acc -> xor (x `A.elem` actual) acc) false expected
  in
    if res then
      pure csvcontent
    else
      invalid [ InvalidCSV $ "file MUST have one and only one of follwoing field: " <> show expected ]

-- | main validation entry point
parseCsvFile :: CsvFileInput -> V Issues CsvFile
parseCsvFile { fileInfo, csvContent } =
  case FileInfo.collection fileInfo of
    Concepts ->
      let
        required = [ "concept", "concept_type" ]

        vc =
          notEmptyCsv csvContent
          `andThen`
          headersExists required
          `andThen`
          colsAreValidIds
      in
       mkCsvFile <$> pure fileInfo <*> vc
    Entities { domain, set } ->
      let
        required = case set of
          Just s -> [ toString s, toString domain ]
          Nothing -> [ toString domain ]

        vc = notEmptyCsv csvContent
          `andThen`
            oneOfHeaderExists required
          `andThen`
            colsAreValidHeaders
      in
       mkCsvFile <$> pure fileInfo <*> vc
    otherwise -> invalid [ NotImplemented ]


-- Validation: Warnings
-- | check if csv file has duplicated headers
noDupCols :: CsvContent -> V Issues Unit
noDupCols input =
  if nub input.headers == input.headers then
    pure unit
  else
    invalid [ InvalidCSV $ "duplicated headers: " <> show dups <> ", only last one will be use" ]
    where
      counter = map (\x -> (Tuple (Narr.head x) (Narr.length x))) <<< Narr.group <<< Narr.sort $ input.headers

      dups = Narr.filter (\x -> (snd x) > 1) counter


-- Utils
-- | CsvRowRec is a valid CsvRow with headers info
type CsvRowRec
  = Tuple (NonEmptyArray Header) (NonEmptyArray String)

-- | create a record from one Row
-- | FIXME: record should be a Map?
parseCsvRowRec :: NonEmptyArray Header -> CsvRow -> V Issues CsvRowRec
parseCsvRowRec headers (CsvRow (Tuple idx row)) =
  if Narr.length headers /= A.length row then
    invalid [ InvalidCSV $ "bad csv row" ]
  else
    pure $ (Tuple headers row_)
  where
  row_ = NonEmptyArray row
