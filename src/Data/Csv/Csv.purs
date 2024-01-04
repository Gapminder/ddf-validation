module Data.Csv
  ( CsvRow(..)
  , RawCsvContent
  , readCsv
  , getRow
  , getLineNo
  , readCsvs
  , create
  ) where

import Prelude

import Control.Promise (Promise, toAffE)
import Data.Either (Either(..))
import Data.Function.Uncurried (Fn1, runFn1)
import Data.Array (length, range, zip, tail, head)
import Data.Array.NonEmpty (fromArray, NonEmptyArray)
import Data.Maybe (Maybe(..))
import Data.Newtype (class Newtype)
import Data.Traversable (sequence, traverse)
import Data.Tuple (Tuple(..), fst, snd)
import Data.Tuple (Tuple)
import Data.Validation.Semigroup (V(..), invalid)
import Effect (Effect)
import Effect.Class (liftEffect)
import Effect.Aff (Aff)
import Node.Encoding (Encoding(..))
import Node.FS.Sync (readTextFile)
import Node.Path (FilePath)
import Safe.Coerce (coerce)

-- | CsvRow is a tuple of line number and row content
newtype CsvRow =
  CsvRow (Tuple Int (Array String)) -- Note: just use type if newtype cost performance.

instance showCsvRow :: Show CsvRow where
  show (CsvRow (Tuple i x)) =
    show rec
    where
    rec = { line: i, record: x }

derive instance newtypeCsvRow :: Newtype CsvRow _

-- | Split headers and data rows
type RawCsvContent =
  { headers :: Maybe (Array String)
  , rows :: Maybe (Array CsvRow)
  }

foreign import readCsvImpl :: Fn1 FilePath (Array (Array String))

readCsv :: FilePath -> Effect (Array (Array String)) -- NOTE: this will not handle exceptions from the js side.
readCsv x = pure $ runFn1 readCsvImpl x

getRow :: CsvRow -> (Array String)
getRow (CsvRow tpl) = snd tpl

getLineNo :: CsvRow -> Int
getLineNo (CsvRow tpl) = fst tpl

toCsvRow :: Array (Array String) -> Array CsvRow
toCsvRow [] = []
toCsvRow xs =
  let
    idxs = range 2 ((length xs) + 1) -- idx starts from 2, excluding header row

    tuples = zip idxs xs

    mkRow tpls = CsvRow tpls
  in
    map mkRow tuples

create :: (Array (Array String)) -> RawCsvContent
create recs = { headers: headers, rows: rows }
  where
  headers = head recs

  rows = toCsvRow <$> tail recs

readCsvs :: (Array FilePath) -> Aff (Array RawCsvContent)
readCsvs = traverse (\f -> create <$> (liftEffect $ readCsv f))

-- TODO: add column view. i.e. convert List CsvRow to List CsvColumn
