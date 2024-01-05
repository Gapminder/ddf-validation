module Data.DDF.Atoms.Boolean where

import Prelude

import Data.Validation.Issue (Issue(..), Issues)
import Data.Validation.Semigroup (V, invalid)

parseBoolean :: String -> V Issues Boolean
parseBoolean x
    | x == "TRUE" = pure true
    | x == "FALSE" = pure false
    | otherwise = invalid [ InvalidValue x "not a boolean value" ]