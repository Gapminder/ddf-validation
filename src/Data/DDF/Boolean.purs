module Data.DDF.Boolean where

import Prelude

import Data.DDF.Validation.Result (Errors, Error(..))
import Data.Validation.Semigroup (V, invalid)

isBoolean :: String -> V Errors Boolean
isBoolean x 
    | x == "TRUE" = pure true
    | x == "FALSE" = pure false
    | otherwise = invalid [ Error $ x <> " is not boolean value" ]
    