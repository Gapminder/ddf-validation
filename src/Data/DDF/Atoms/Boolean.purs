module Data.DDF.Atoms.Boolean where

import Prelude

import Data.Validation.Issue (Issue(..), Issues)
import Data.Validation.Semigroup (V, invalid)

-- TODO move this to Value module

parseBoolean :: String -> V Issues Boolean
parseBoolean x
    | x == "TRUE" = pure true
    | x == "true" = pure true
    | x == "FALSE" = pure false
    | x == "false" = pure false
    | otherwise = invalid [ InvalidValue x "not a boolean value" ]
