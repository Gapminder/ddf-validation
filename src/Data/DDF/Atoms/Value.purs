module Data.DDF.Atoms.Value where

import Prelude

import Data.DDF.Atoms.Identifier (Identifier)
import Data.List (List)
import Data.Map (Map)
import Data.Validation.Semigroup (V, invalid)
import Data.Validation.Issue (Issue(..), Issues)
import Data.String.NonEmpty (NonEmptyString, fromString)
import Data.Maybe (Maybe(..), isJust)
import Data.HashSet (HashSet)
import Data.HashSet as HS
import Data.Array as Arr
import Data.Number as Num
import Data.String as Str
import Data.Int as Int
import Partial.Unsafe (unsafeCrashWith)

-- | types of values, which appear in table cells.
data Value
  = DomainVal NonEmptyString -- string in a domain
  | StrVal String -- normal string
  | NumVal Number -- numbers
  | BoolVal Boolean -- boolean
  | TimeVal String -- bounded by a format
  | ListVal String -- a list of other values.
  | JsonVal String -- json string

instance showValue :: Show Value where
  show (DomainVal x) = show x
  show (StrVal x) = show x
  show (NumVal x) = show x
  show (BoolVal x) = show x
  show (TimeVal x) = show x
  show (ListVal x) = show x
  show (JsonVal x) = show x

derive instance eqValue :: Eq Value

instance ordValue :: Ord Value where
  compare (DomainVal x) (DomainVal y) = compare x y
  compare (StrVal x) (StrVal y) = compare x y
  compare (NumVal x) (NumVal y) = compare x y
  compare (BoolVal x) (BoolVal y) = compare x y
  compare (TimeVal x) (TimeVal y) = compare x y
  compare (ListVal x) (ListVal y) = compare x y
  compare (JsonVal x) (JsonVal y) = compare x y
  -- TODO: is there safe method to do ord?
  compare _ _ = unsafeCrashWith "the comparsion failed because we are comparing different types of value"

-- type Properties = Map Identifier Value

type ValueParser = String -> V Issues Value

isEmpty :: Value -> Boolean
isEmpty (DomainVal _) = true
isEmpty (StrVal x) = Str.null x
isEmpty (NumVal _) = true
isEmpty (BoolVal _) = true
isEmpty (TimeVal x) = Str.null x
isEmpty (ListVal x) = Str.null x
isEmpty (JsonVal x) = Str.null x

-- | check if string is empty
parseNonEmptyString :: String -> V Issues NonEmptyString
parseNonEmptyString input =
  case fromString input of
    Nothing -> invalid [ Issue $ "value must be not empty" ]
    Just str -> pure str

-- | parse a domain value
parseDomainVal :: HashSet String -> String -> V Issues Value
parseDomainVal domain input =
  case fromString input of
    Nothing -> invalid $ [ Issue $ input <> " is not a valid value in its domain." ]
    Just s ->
      if HS.member input domain then
        pure $ DomainVal s
      else
        invalid $ [ Issue $ input <> " is not a valid value in its domain." ]

parseStrVal :: String -> V Issues Value
parseStrVal x = pure $ StrVal x

-- | just return string value
parseStrVal' :: String -> Value
parseStrVal' = StrVal

parseBoolVal :: String -> V Issues Value
parseBoolVal "TRUE" = pure $ BoolVal true
parseBoolVal "FALSE" = pure $ BoolVal false
parseBoolVal x = invalid [ Issue $ "not a boolean value: " <> show x ]

-- Num.fromString use parseFloat() from js which allows whitespace prefix and other chars at
-- the end.
-- TODO: Need to find a better way or write my own
parseNumVal :: String -> V Issues Value
parseNumVal input =
  case Num.fromString input of
    Nothing -> invalid [ Issue $ input <> " is not a number." ]
    Just n -> pure $ NumVal n

-- TODO add more complex time parser.
parseTimeVal :: ValueParser
parseTimeVal input =
  if (Str.length input == 4) && (isJust $ Int.fromString input) then
    pure $ TimeVal input
  else
    invalid [ Issue $ (show input) <> " is not a valid time value." ]
