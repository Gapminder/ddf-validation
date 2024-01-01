module Data.DDF.Atoms.Header where

import Prelude
import StringParser

import Control.Alt ((<|>))
import Data.DDF.Atoms.Identifier (Identifier)
import Data.DDF.Atoms.Identifier as Id
import Data.String.NonEmpty (join1With, toString)
import Data.String.NonEmpty.Internal (NonEmptyString(..))
import Data.Newtype (class Newtype, unwrap)
import Data.Show.Generic (genericShow)
import Data.Newtype (class Newtype, unwrap)
import Data.Either (Either(..), fromLeft, fromRight, isLeft)
import Data.Generic.Rep (class Generic)
import Data.Validation.Issue (Issue(..), Issues)
import Data.Validation.Semigroup (V, andThen, invalid, isValid, toEither)


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

-- FIXME: I should move these parser to Atoms module
-- | parse is--entity_set headers
is_header :: Parser NonEmptyString
is_header = do
  begin <- string "is--"
  val <- Id.identifier
  pure $ (NonEmptyString begin) <> val

-- | parse valid header
header :: Parser NonEmptyString
header = do
  h <- is_header <|> Id.identifier
  void $ eof
  pure h

-- | run parser for header
parseHeader :: String -> V Issues Header
parseHeader x = case runParser header x of
  Right str -> pure $ Header str
  Left e -> invalid [ err ]
    where
    pos = show $ e.pos

    msg = "invalid header: " <> x <> ", " <> e.error <> "at pos " <> pos

    err = InvalidCSV msg

-- | run parser for header, return result as Either
createHeader :: String -> Either Issues Header
createHeader x = toEither $ parseHeader x
