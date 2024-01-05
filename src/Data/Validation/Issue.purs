module Data.Validation.Issue where

import Prelude

import Data.List (List)
import Node.Path (FilePath)
import Data.Generic.Rep (class Generic)
import Data.Newtype (class Newtype)
import Data.Show.Generic (genericShow)


type Msg = String


-- | The issue type
data Issue
  = NotImplemented
  | Issue Msg
  | InvalidValue String Msg
  | IdLongerThan64Chars String
  | InvalidCSV Msg
  | InvalidDDFCSV String Msg
  | DuplicatedItem FilePath Int Msg

derive instance genericIssue :: Generic Issue _

instance showId :: Show Issue where
  show = genericShow

type Issues = Array Issue
