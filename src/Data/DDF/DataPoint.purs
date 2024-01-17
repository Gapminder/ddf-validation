-- | Definition of datapoint

module Data.DDF.DataPoint where

import Prelude

import Data.Array.NonEmpty (NonEmptyArray)
import Data.Array.NonEmpty as NEA
import Data.DDF.Atoms.Header (Header)
import Data.DDF.Atoms.Identifier (Identifier, parseId', parseId)
import Data.DDF.Atoms.Value
import Data.DDF.BaseDataSet (BaseDataSet)
import Data.DDF.Csv.CsvFile (CsvFile)
import Data.DDF.Csv.FileInfo as FI
import Data.DDF.Internal (ItemInfo)
import Data.List.NonEmpty (NonEmptyList)
import Data.List.NonEmpty as NEL
import Data.Map (Map)
import Data.Map as M
import Data.Maybe (Maybe(..))
import Data.String.NonEmpty (NonEmptyString, toString)
import Data.Tuple (Tuple(..))
import Data.Validation.Issue (Issue(..), Issues)
import Data.Validation.Semigroup (V, andThen, invalid)
import Data.List (List)
import Data.List as List
import Data.Array as Arr
import Data.Traversable (sequence)
import Data.Function (on)
import Utils (dupsBy)

-- | Datapoints contain multidimensional data.
-- | Data in DDF is stored in key-value pairs called DataPoints.
-- | The key consists of two or more dimensions while the value consists of one indicators
newtype DataPointList =
  DataPointList
    { indicatorId :: Identifier
    , primaryKeys :: NonEmptyList Identifier -- TODO: NonEmptyList means 1 or more. Find a type to repersent 2 or more dims
    , datapoints :: List Point
    }

-- | Point is a key value pair
type Point =
  { key :: NonEmptyList Value -- A list of values
  , value :: Value -- one value
  , _info :: Maybe ItemInfo -- additional infos
  }

instance showDataPointList :: Show DataPointList where
  show (DataPointList rec) = show rec

-- | DataPoint input from CsvFile
-- indicatorId and primaryKeys are from CsvFile name, so they are NonEmptyString already.
type DataPointListInput =
  { indicatorId :: Identifier
  , primaryKeys :: NonEmptyList Identifier
  , datapoints :: Array PointInput
  }

type PointInput =
  { key :: NonEmptyList String
  , value :: String
  , _info :: Maybe ItemInfo
  }

datapointList
  :: Identifier
  -> NonEmptyList Identifier
  -> List Point
  -> DataPointList
datapointList indicatorId primaryKeys datapoints =
  DataPointList { indicatorId, primaryKeys, datapoints }

datapoint
  :: NonEmptyList Value
  -> Value
  -> (Maybe ItemInfo)
  -> Point
datapoint key value _info = { key, value, _info }

-- | key parsers and value parser were used to parse the values in a Point
parseDataPointWithValueParser
  :: NonEmptyList ValueParser
  -> ValueParser
  -> PointInput
  -> V Issues Point
parseDataPointWithValueParser keyParsers valParser input =
  ado
    value <- valParser input.value
    keys <- NEL.sequence1 $ NEL.zipWith (\f x -> f x) keyParsers input.key
    in
      datapoint keys value input._info

checkDuplicatedPoints :: Array Point -> V Issues (Array Point)
checkDuplicatedPoints pts =
  let
    dups = dupsBy (compare `on` _.key) pts
  in
    case Arr.head dups of
      Nothing -> pure pts
      Just _ -> invalid [ Issue $ "duplicated datapoints: " <> show dups ]

parseDataPointListWithValueParser
  :: NonEmptyList ValueParser
  -> ValueParser
  -> DataPointListInput
  -> V Issues DataPointList
parseDataPointListWithValueParser keyParsers valParser input =
  let
    run :: PointInput -> V Issues Point
    run x = parseDataPointWithValueParser keyParsers valParser x

    points :: V Issues (Array Point)
    points = (sequence $ map run input.datapoints)
      `andThen` checkDuplicatedPoints

    pointsList = List.fromFoldable <$> points
  in
    datapointList
      <$> pure input.indicatorId
      <*> pure input.primaryKeys
      <*> pointsList
