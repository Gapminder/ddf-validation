module Data.JSON.DataPackage where

import Prelude
import Data.Argonaut.Parser (jsonParser)
import Data.DDF.Validation.Result (Errors, Error(..))
import Data.List (List)
import Data.Maybe (Maybe(..))
import Data.String.NonEmpty.Internal (NonEmptyString(..))
import Data.Validation.Semigroup (V, invalid)
import Effect (Effect)
import Node.FS.Sync (exists, readFile)
import Node.Path (FilePath)
import Node.Path as Path

data DataPackage
  = DataPackage
    { basePath :: FilePath
    , resources :: List Resource
    }

data Resource
  = Resource
    { path :: NonEmptyString
    , name :: NonEmptyString
    , schema :: JSONSchema
    }

data JSONSchema
  = JSONSchema
    { primaryKeys :: List NonEmptyString
    , fields :: List SchemaField
    }

data SchemaField
  = SchemaField
    { name :: NonEmptyString
    , constrains :: Maybe { enum :: Array NonEmptyString }
    }

datapackageExists :: FilePath -> Effect (V Errors FilePath)
datapackageExists path = do
  let
    datapackagePath = Path.concat [ path, "datapackage.json" ]

    v true = pure path

    v false = invalid [ Error $ "no datapackage in this folder" ]
  dpExisted <- exists datapackagePath
  pure $ v dpExisted
