module Data.DDF.Atoms.Value where

import Prelude

import Data.DDF.Concept (ConceptType)
import Data.DDF.Atoms.Identifier (Identifier)
import Data.List (List)
import Data.Map (Map)


data Value =
    IdVal Identifier
    | BoolVal String
    | StrVal String
    | NumVal Number
    | TimeVal String
    | ConceptTypeVal ConceptType
    | ListVal (List Value)

type Properties = Map Identifier Value
