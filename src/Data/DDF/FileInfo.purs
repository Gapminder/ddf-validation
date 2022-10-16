module Data.DDF.FileInfo where

import Prelude

import Control.Alt ((<|>))
import Data.DDF.Identifier (identifier)
import Data.DDF.Validation.Result (Errors, Error(..))
import Data.Either (Either(..))
import Data.List (List(..))
import Data.List.Types (NonEmptyList)
import Data.Array as A
import Data.Maybe (Maybe(..))
import Data.String (Pattern(..), stripSuffix)
import Data.String.NonEmpty (NonEmptyString(..))
import Data.Tuple (Tuple(..), fst, snd)
import Data.Validation.Semigroup (V, invalid, toEither)
import Node.Path (FilePath, basename)
import StringParser (Parser, choice, eof, runParser, sepBy1, sepEndBy1, string, try)

-- | file info are information contains in file name.
-- | it consists of 3 parts
-- | the full file path, the collection info object and name
data FileInfo
  = FileInfo FilePath CollectionInfo String

-- alternative:
-- data FileInfo
--   = FileInfo
--     { path :: String
--     , collection :: CollectionInfo
--     , name :: String
--     }
-- Which one is better??

-- | collection info
-- | there are 3 main collections
-- | Entities, DataPoints and Concepts
data CollectionInfo
  = Concepts
  | Entities Ent
  | DataPoints DP
  | Other NonEmptyString

type Ent
  = { domain :: NonEmptyString, set :: Maybe NonEmptyString }

type DP
  = { indicator :: NonEmptyString, pkeys :: NonEmptyList NonEmptyString, constrains :: NonEmptyList (Maybe NonEmptyString) }

instance showCollection :: Show CollectionInfo where
  show Concepts = "concepts"
  show (Entities e) = case e.set of
    Nothing -> "entity_domain: " <> show e.domain
    Just s -> "entity_domain: " <> show e.domain <> "; entnty_set: " <> show s
  show (DataPoints d) = "datapoints: " <> show d.indicator
  show (Other x) = "custom collection: " <> show x

instance showFileInfo :: Show FileInfo where
  show (FileInfo fp ci _) = "file: " <> fp <> "; collection: " <> show ci

isConceptFile :: FileInfo -> Boolean
isConceptFile (FileInfo _ collection _) = case collection of
  Concepts -> true
  _ -> false

isEntitiesFile :: FileInfo -> Boolean
isEntitiesFile (FileInfo _ collection _) = case collection of
  Entities _ -> true
  _ -> false

isDataPointsFile :: FileInfo -> Boolean
isDataPointsFile (FileInfo _ collection _) = case collection of
  DataPoints _ -> true
  _ -> false

filepath :: FileInfo -> FilePath
filepath (FileInfo fp _ _) = fp

collection :: FileInfo -> CollectionInfo
collection (FileInfo _ c _) = c

-- | filter a collection from array of fileinfos
getCollectionFiles :: String -> Array FileInfo -> Array FileInfo
getCollectionFiles "concepts" = A.filter isConceptFile
getCollectionFiles "entities" = A.filter isEntitiesFile
getCollectionFiles "datapoints" = A.filter isDataPointsFile
getCollectionFiles _ = \_ -> [] -- partical function

--
-- Below are parsers for ddf file names
--
ddfFileBegin :: Parser Unit
ddfFileBegin = void $ string "ddf--"

-- ddfFileEnd :: Parser Unit
-- ddfFileEnd = string "" *> eof
-- Parse concept file name
-- | concept file name format 1
c1 :: Parser String
c1 = string "ddf--concepts" <* eof

-- | concept file name format 2
c2 :: Parser String
c2 = do
  p1 <- string "ddf--concepts--"
  p2 <- string "discrete" <|> string "continuous"
  void $ eof
  pure $ p1 <> p2

conceptFile :: Parser CollectionInfo
conceptFile = choice [ try c1, try c2 ] *> pure Concepts

-- parse Entity file name
-- | entity domain without set info
e1 :: Parser CollectionInfo
e1 = do
  ddfFileBegin
  void $ string "entities--"
  domain <- identifier
  eof
  pure $ Entities { domain: domain, set: Nothing }

-- | entity domain with set info
e2 :: Parser CollectionInfo
e2 = do
  ddfFileBegin
  void $ string "entities--"
  domain <- identifier
  void $ string "--"
  eset <- identifier
  eof
  pure $ Entities { domain: domain, set: Just eset }

entityFile ∷ Parser CollectionInfo
entityFile = choice [ try e2, try e1 ]

-- datapoint file parsers
--
pkeyWithConstrain :: Parser (Tuple NonEmptyString (Maybe NonEmptyString))
pkeyWithConstrain = do
  key <- identifier
  void $ string "-"
  constrain <- identifier
  pure $ Tuple key (Just constrain)

pkeyNoConstrain :: Parser (Tuple NonEmptyString (Maybe NonEmptyString))
pkeyNoConstrain = do
  key <- identifier
  pure (Tuple key Nothing)

pkey :: Parser (Tuple NonEmptyString (Maybe NonEmptyString))
pkey = choice [ try pkeyWithConstrain, try pkeyNoConstrain ]

datapointFile :: Parser CollectionInfo
datapointFile = do
  ddfFileBegin
  void $ string "datapoints--"
  -- TODO: support multiple indicators
  indicator <- identifier
  void $ string "--by--"
  dims <- sepBy1 pkey (string "--")
  let
    pkeys = map fst dims

    constrains = map snd dims
  pure $ DataPoints { indicator, pkeys, constrains }

getName :: String -> Maybe String
getName = stripSuffix (Pattern ".csv")

validateFileInfo :: FilePath -> V Errors FileInfo
validateFileInfo fp = case getName $ basename fp of
  Nothing -> invalid [ Error $ fp <> " is not a csv file" ]
  Just fn ->
    let
      fileParser = conceptFile <|> entityFile <|> datapointFile
    in
      case runParser fileParser fn of
        Right ci -> pure $ FileInfo fp ci fn
        Left err -> invalid [ Error $ fp <> " is not correct ddf file: " <> err.error ]

fromFilePath :: FilePath -> Either Errors FileInfo
fromFilePath = toEither <<< validateFileInfo

