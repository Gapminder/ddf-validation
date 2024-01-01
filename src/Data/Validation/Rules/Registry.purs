module Data.Rules.Registry where

import Prelude

-- This file should contain all rules' ID and Messages
data ErrorType =
    NotAnIdentifier
    | MissingField
    | DuplicatedCsvHeader
