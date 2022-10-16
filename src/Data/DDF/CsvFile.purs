-- | Validate if it's a valid ddf csv file
module Data.DDF.CsvFile where

import Prelude
import StringParser
import Control.Alt ((<|>))
import Data.Array as A
import Data.Array.NonEmpty (NonEmptyArray, nub)
import Data.Array.NonEmpty as Narr
import Data.Array.NonEmpty.Internal (NonEmptyArray(..))
import Data.Csv (CsvRow(..), RawCsvContent)
import Data.DDF.FileInfo (CollectionInfo(..), FileInfo(..))
import Data.DDF.FileInfo as FileInfo
import Data.DDF.Identifier (Identifier)
import Data.DDF.Identifier as Id
import Data.DDF.Validation.Result (Errors, Error(..))
import Data.DDF.Validation.ValidationT (Validation, vError, vWarning)
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

newtype Header
  = Header NonEmptyString

derive instance newtypeHeader :: Newtype Header _

derive instance genericHeader :: Generic Header _

derive instance eqHeader :: Eq Header

derive instance ordHeader :: Ord Header

instance showHeader :: Show Header where
  show = genericShow

headerVal :: Header -> NonEmptyString
headerVal = unwrap

is_header :: Parser NonEmptyString
is_header = do
  begin <- string "is--"
  val <- Id.identifier
  pure $ (NonEmptyString begin) <> val

header :: Parser NonEmptyString
header = do
  h <- is_header <|> Id.identifier
  void $ eof
  pure h

parseHeader :: String -> V Errors Header
parseHeader x = case runParser header x of
  Right str -> pure $ Header str
  Left e -> invalid [ err ]
    where
    pos = show $ e.pos

    msg = "invalid header: " <> x <> ", " <> e.error <> "at pos " <> pos

    err = Error msg

createHeader :: String -> Either Errors Header
createHeader x = toEither $ parseHeader x

-- | CsvContent is the data read from a csv file.
type CsvContent
  = { headers :: NonEmptyArray Header
    , rows :: Array CsvRow
    }

-- | csv file combines file name info and file content
data CsvFile
  = CsvFile
    { fileInfo :: FileInfo
    , csvContent :: CsvContent
    }

instance showCsvFile :: Show CsvFile where
  show (CsvFile x) = show x

mkCsvContent :: NonEmptyArray Header -> Array CsvRow -> CsvContent
mkCsvContent headers rows = { headers: headers, rows: rows }

mkCsvFile :: FileInfo -> CsvContent -> CsvFile
mkCsvFile fi csv = CsvFile { fileInfo: fi, csvContent: csv }

getCsvContent :: CsvFile -> CsvContent
getCsvContent (CsvFile { csvContent }) = csvContent

getFileInfo :: CsvFile -> FileInfo
getFileInfo (CsvFile { fileInfo }) = fileInfo

-- | CsvRec is a valid CsvRow with headers info
type CsvRec
  = Tuple (NonEmptyArray Header) (NonEmptyArray String)

-- below are intermediate types and validations
--
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
notEmptyCsv :: RawCsvContent -> V Errors NonEmptyRawCsvContent
notEmptyCsv input = case join $ Narr.fromArray <$> input.headers of
  Nothing -> invalid [ Error "no headers" ]
  Just hs -> case input.rows of
    Nothing -> pure $ { headers: hs, rows: [] }
    Just rs -> pure $ { headers: hs, rows: rs }

-- | check all columns are valid identifiers
colsAreValidIds :: NonEmptyRawCsvContent -> V Errors CsvContent
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
            xs -> invalid [ Error $ "these headers are not valid Ids: " <> show xs ]
      Left errs -> invalid errs

-- | check all columns are valid headers (including is-- headers)
colsAreValidHeaders :: NonEmptyRawCsvContent -> V Errors CsvContent
colsAreValidHeaders input =
  let
    res = sequence $ map parseHeader input.headers
  in
    case toEither res of
      Right hs -> pure $ input { headers = hs }
      Left errs -> invalid errs

-- | check required headers
headersExists :: Array String -> NonEmptyRawCsvContent -> V Errors NonEmptyRawCsvContent
headersExists expected csvcontent =
  let
    -- requiredFields = A.fromFoldable expected
    actual = A.fromFoldable csvcontent.headers
  in
    if hasCols expected actual then
      pure csvcontent
    else
      invalid [ Error $ "file MUST have following field: " <> show expected ]

-- | check if one and only one of the headers exists
oneOfHeaderExists :: Array String -> NonEmptyRawCsvContent -> V Errors NonEmptyRawCsvContent
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
      invalid [ Error $ "file MUST have one and only one of follwoing field: " <> show expected ]

-- FIXME: refactor, use V
-- | check if csv file has duplicated headers.
noDupCols :: CsvContent -> Validation Errors CsvContent
noDupCols input =
  if nub input.headers == input.headers then
    pure input
  else
    let
      counter = map (\x -> (Tuple (Narr.head x) (Narr.length x))) <<< Narr.group <<< Narr.sort $ input.headers

      dups = Narr.filter (\x -> (snd x) > 1) counter
    in
      do
        vWarning [ Error $ "duplicated headers: " <> show dups <> ", only last one will be use" ]
        pure input -- Maybe remove dups

-- | check if file info matched with csv file headers
validCsvFile :: FileInfo -> RawCsvContent -> V Errors CsvFile
validCsvFile f@(FileInfo _ collection _) csvcontent = case collection of
  Concepts ->
    let
      required = [ "concept", "concept_type" ]

      vc =
        notEmptyCsv csvcontent
          `andThen`
            headersExists required
          `andThen`
            colsAreValidIds
    in
      mkCsvFile <$> pure f <*> vc
  Entities { domain, set } ->
    let
      required = case set of
        Just s -> [ toString s, toString domain ]
        Nothing -> [ toString domain ]

      vc =
        notEmptyCsv csvcontent
          `andThen`
            oneOfHeaderExists required
          `andThen`
            colsAreValidHeaders
    in
      mkCsvFile <$> pure f <*> vc
  otherwise -> invalid [ Error "not implemented" ]

-- | create a record from one Row
-- | record is a Map
validCsvRec :: NonEmptyArray Header -> CsvRow -> V Errors CsvRec
validCsvRec headers (CsvRow (Tuple idx row)) =
  if Narr.length headers /= A.length row then
    invalid [ Error $ "bad csv row" ]
  else
    pure $ (Tuple headers row_)
  where
  row_ = NonEmptyArray row
