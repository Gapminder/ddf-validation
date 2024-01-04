module Data.DDF.Atoms.Value where

import Prelude

import Data.DDF.Concept (ConceptType)
import Data.DDF.Atoms.Identifier (Identifier)
import Data.List (List)
import Data.Map (Map)
import Data.Validation.Semigroup (V, invalid)
import Data.Validation.Issue (Issue(..), Issues)
import Data.String.NonEmpty (NonEmptyString, fromString)
import Data.Maybe (Maybe(..))


data Value =
    IdVal Identifier
    | BoolVal String
    | StrVal String
    | NumVal Number
    | TimeVal String
    | ConceptTypeVal ConceptType
    | ListVal (List Value)

-- type Properties = Map Identifier Value

-- | check if string is empty
parseNonEmptyString :: String -> V Issues NonEmptyString
parseNonEmptyString input =
  case fromString input of
    Nothing -> invalid [ Issue $ "value must be not empty" ]
    Just str -> pure str
