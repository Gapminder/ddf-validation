-- | Validation of datapoints
-- there are only a few rules
-- 1. detect duplicated keys (I think this is hardest)
-- 2. volilate constrains in filename
-- 3. unexpected entity value (time/geo etc)
-- 4. meaure value is not numeric

module Data.DDF.DataPoint where

import Prelude

import Data.DDF.Atoms.Identifier (Identifier)
import Data.DDF.Csv.CsvFile (CsvFile)
import Data.DDF.Csv.FileInfo as FI
import Data.DDF.DataSet (DataSet)
import Data.Map (Map)
import Data.Validation.Semigroup (V)

-- DataPoint input:
-- consume one row of csv
type DataPointInput = Map Identifier String

-- then check constrains, entity/concept values
-- checkConstrains :: DataSet -> FileInfo -> DataPointInput -> DataSetWithDPInput

-- then produce an other type of input
-- data DataSetWithDPInput = DataSetWithDPInput
--   { dataset :: DataSet
--   , indicator :: Array DataPoint -- to be defined
--   }

-- when we have all datapoints as an array,
-- check for duplicates in pkeys.
-- checkDups :: DataSetWithDPInput -> DataSetWithDP

-- Maybe just call them DataPoint (for one point) and
-- DataPointCollection (for all data)
data DataPoint =
  DataPoint { indicatorID :: Identifier
            , dimensions :: Array Identifier
            , dimensionValues :: Array String
            , value :: String
            }
