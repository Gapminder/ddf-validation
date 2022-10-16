module Data.Csv where

import Prelude

import Control.Promise (Promise, toAffE)
import Data.DDF.Validation.Result (Errors, Error(..))
import Data.DDF.Validation.Result as Res
import Data.Either (Either(..))
import Data.Function.Uncurried (Fn1, runFn1)
import Data.Array (length, range, zip, tail, head)
import Data.Maybe (Maybe(..))
import Data.Newtype (class Newtype)
import Data.Traversable (sequence, traverse)
import Data.Tuple (Tuple(..), fst, snd)
import Data.Tuple (Tuple)
import Data.Validation.Semigroup (V(..), invalid)
import Effect (Effect)
import Effect.Aff (Aff)
import Node.Encoding (Encoding(..))
import Node.FS.Sync (readTextFile)
import Node.Path (FilePath)
import Safe.Coerce (coerce)

newtype CsvRow = 
  CsvRow (Tuple Int (Array String))

instance showCsvRow :: Show CsvRow where
  show (CsvRow (Tuple i x)) = 
    show rec 
    where 
      rec = { line: i, record: x }

derive instance newtypeCsvRow :: Newtype CsvRow _

foreign import readCsvImpl :: Fn1 FilePath (Array (Array String))

-- TODO: Maybe Change to Aff
readCsv :: FilePath -> Effect (Array (Array String))
readCsv x =
  pure $ runFn1 readCsvImpl x

getRow :: CsvRow -> (Array String)
getRow (CsvRow tpl) = snd tpl

getLineNo :: CsvRow -> Int
getLineNo (CsvRow tpl) = fst tpl

type RawCsvContent
  = { headers :: Maybe (Array String)
    , rows :: Maybe (Array CsvRow)
    }

toCsvRow :: Array (Array String) -> Array CsvRow
toCsvRow [] = []
toCsvRow xs = 
  let
    idxs = range 1 (length xs)

    tuples = zip idxs xs

    mkRow tpls = CsvRow tpls
  in 
    map mkRow tuples

create :: (Array (Array String)) -> RawCsvContent
create recs = { headers: headers, rows: rows }
  where
  headers = head recs

  rows = toCsvRow <$> tail recs

readCsvs :: (Array FilePath) -> Effect (Array RawCsvContent)
readCsvs = traverse (\f -> create <$> (readCsv f))

-- TODO: add column view. i.e. convert List CsvRow to List CsvColumn