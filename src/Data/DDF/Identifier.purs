module Data.DDF.Identifier where

import Data.Validation.Semigroup
import Prelude
import StringParser

import Control.Alt ((<|>))
import Data.Array.NonEmpty (fromFoldable1)
import Data.DDF.Validation.Result (Errors, Error(..))
import Data.Either (Either(..))
import Data.Generic.Rep (class Generic)
import Data.Maybe (Maybe(..))
import Data.Newtype (class Newtype, unwrap)
import Data.Show.Generic (genericShow)
import Data.String.NonEmpty.CodeUnits (charAt, fromNonEmptyCharArray)
import Data.String.NonEmpty.Internal (NonEmptyString(..), fromString, toString)

-- Definition of identifiers. They are strings
-- But with a limitation: ...
newtype Identifier
  = Id NonEmptyString

derive instance newtypeId :: Newtype Identifier _

derive instance genericId :: Generic Identifier _

derive instance eqId :: Eq Identifier

derive instance ordId :: Ord Identifier

instance showId :: Show Identifier where
  show = genericShow

value :: Identifier -> String
value (Id x) = toString $ x

-- | parse lower case alphanum strings
alphaNumLower :: Parser Char
alphaNumLower =
  lowerCaseChar <|> anyDigit
    <?> "expect lowercase alphanumeric value"

-- | parse lower case alphanum strings also allow underscores inside
alphaNumAnd_ :: Parser Char
alphaNumAnd_ =
  alphaNumLower <|> char '_'
    <?> "expect lowercase alphanumeric and underscore _"

-- | parse identifier strings.
identifier :: Parser NonEmptyString
identifier = do
  chars <- many1 alphaNumAnd_
  pure $ stringFromChars chars
  where
  stringFromChars = fromNonEmptyCharArray <<< fromFoldable1

-- | check if the whole string is an identifer
identifier' :: Parser NonEmptyString
identifier' = identifier <* eof

-- | parse an id
parseId :: String -> V Errors Identifier
parseId x = case runParser identifier' x of
  Right str -> pure $ Id str
  Left e -> invalid [ err ]
    where
    pos = show $ e.pos

    msg = "invalid id: " <> x <> ", " <> e.error <> "at pos " <> pos

    err = Error msg

-- | check if identifier longer than 64 chars
-- idenfitier longer than 64 chars is know to break WS server
isLongerThan64Chars :: Identifier -> V Errors Identifier
isLongerThan64Chars a =
  let
    str = unwrap a
  in
    case charAt 64 str of
      Nothing -> pure a
      Just _ -> invalid [ Error $ toString str <> " longer than 64 chars" ]

-- | parse an id, return Either instead
create :: String -> Either Errors Identifier
create x = toEither $ parseId x

-- | unsafe create an id, because we won't check the string.
-- | only use this when you know what you are doning
unsafeCreate :: String -> Identifier
unsafeCreate x = case fromString x of
  Just a -> Id a
  Nothing -> Id $ NonEmptyString "undefined_id"
