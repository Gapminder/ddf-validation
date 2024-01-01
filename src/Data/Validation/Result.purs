module Data.Validation.Result where

import Prelude

import Data.Array (find)
import Data.Validation.Issue (Issue(..))
import Data.Generic.Rep (class Generic)
import Data.Maybe (Maybe(..))
import Data.Newtype (class Newtype)
import Data.Show.Generic (genericShow)

-- type Input = String
-- type IssueMsg = String

-- -- | Issue names
-- data Issue
--   = BadCsvRow IssueMsg
--   | NotAnIdentifier Input IssueMsg
--   | NotACsvFile Input
--   | NotDDFFile Input IssueMsg
--   | NoHeaders
--   | InvalidHeader Input IssueMsg
--   | DuplicatedCsvHeader Input
--   | MandatoryFieldNotFound Input
--   | GeneralIssue Input
--   | DuplicatedConcept Input
--   | DuplicatedEntity Input
--   | NotImplemented


-- | message that contains context information and the issue.
type Message
  = { message :: String
    , file :: String
    , lineNo :: Int
--     , suggestions :: String   -- TODO: add this later
    , isWarning :: Boolean
    }

type Messages = Array Message

setFile :: String -> Message -> Message
setFile f m = m { file = f }

setLineNo :: Int -> Message -> Message
setLineNo i m = m { lineNo = i }

-- setSuggestions :: String -> Message -> Message
-- setSuggestions s m = m { suggestions = s }

setError :: Message -> Message
setError m = m { isWarning = false }

messageFromError :: Issue -> Message
messageFromError issue = { message: show issue, file: "", lineNo: 0, isWarning: true }

hasError :: Array Message -> Boolean
hasError msgs =
  case find (\msg -> not $ msg.isWarning) msgs of
    Nothing -> false
    Just _ -> true
