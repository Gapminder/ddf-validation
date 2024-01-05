-- | Definition of datapoint

module Data.DDF.DataPoint where

import Prelude
import Data.DDF.Internal (ItemInfo)
import Data.DDF.Atoms.Header (Header)
import Data.DDF.Atoms.Identifier (Identifier, parseId', parseId)
import Data.DDF.Atoms.Value (Value, parseNonEmptyString)
import Data.DDF.BaseDataSet (BaseDataSet)
import Data.DDF.Csv.CsvFile (CsvFile)
import Data.DDF.Csv.FileInfo as FI
import Data.List.NonEmpty (NonEmptyList)
import Data.List.NonEmpty as NEL
import Data.Array.NonEmpty as NEA
import Data.Map (Map)
import Data.Map as M
import Data.String.NonEmpty (NonEmptyString, toString)
import Data.Tuple (Tuple(..))
import Data.Validation.Issue (Issues)
import Data.Validation.Semigroup (V, andThen)
import Data.Maybe (Maybe(..))


-- | Datapoints contain multidimensional data.
-- Data in DDF is stored in key-value pairs called DataPoints.
-- The key consists of two or more dimensions while the value consists of one indicators
newtype DataPoint =
  DataPoint
    { indicatorId :: Identifier
    , primaryKeys :: NonEmptyList Identifier -- TODO: NonEmptyList means 1 or more. Find a type to repersent 2 or more dims
    , primaryKeyValues :: NonEmptyList String
    , value :: String -- it should be one of the Value types. But we cannot parse it solely from datapoint itself.
    -- , props :: Map Identifier String  -- no other poperties in datapoint files. They are defined in metadata.
    , _info :: Maybe ItemInfo
    }

instance showDataPoint :: Show DataPoint where
  show (DataPoint x) = show x

-- type Props = Map Identifier String

-- | DataPoint input from CsvFile
-- indicatorId and primaryKeys are from CsvFile name, so they are NonEmptyString already.
type DataPointInput =
  { indicatorId :: NonEmptyString
  , primaryKeys :: NonEmptyList NonEmptyString
  , primaryKeyValues :: NonEmptyList String
  , value :: String
  -- , props :: Map Identifier String
  , _info :: Maybe ItemInfo
  }


create :: Identifier -> NonEmptyList Identifier -> NonEmptyList String -> String -> DataPoint
create indicatorId primaryKeys primaryKeyValues value =
  let
    _info = Nothing
  in
    DataPoint { indicatorId, primaryKeys, primaryKeyValues, value, _info }

setInfo :: Maybe ItemInfo -> DataPoint -> DataPoint
setInfo info (DataPoint rec) =
  DataPoint (rec { _info = info })


parseIdList :: NonEmptyList NonEmptyString -> V Issues (NonEmptyList Identifier)
parseIdList xs = NEL.sequence1 $ parseId' <$> xs

parseStringList :: NonEmptyList String -> V Issues (NonEmptyList NonEmptyString)
parseStringList xs = NEL.sequence1 $ parseNonEmptyString <$> xs


parseDataPoint :: DataPointInput -> V Issues DataPoint
parseDataPoint input =
  create
   <$> (parseId' input.indicatorId)
   <*> (parseIdList input.primaryKeys)
   <*> pure input.primaryKeyValues
   <*> pure input.value
