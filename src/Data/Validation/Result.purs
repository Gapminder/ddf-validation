module Data.Validation.Result where

import Prelude

import Data.Array (find)
import Data.Validation.Issue (Issue(..))
import Data.Generic.Rep (class Generic)
import Data.Maybe (Maybe(..))
import Data.Newtype (class Newtype)
import Data.Show.Generic (genericShow)
import Data.String (null)


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

messageFromIssue :: Issue -> Message
messageFromIssue (InvalidItem fp row msg) = { message: msg, file: fp, lineNo: row, isWarning: true }
messageFromIssue issue = { message: show issue, file: "", lineNo: -1, isWarning: true }

hasError :: Array Message -> Boolean
hasError msgs =
  case find (\msg -> not $ msg.isWarning) msgs of
    Nothing -> false
    Just _ -> true


showMessage :: Message -> String
showMessage { message, file, lineNo, isWarning } =
  let
    statstr = if isWarning then "[WARN] " else "[ERR] "
    filestr = if null file then "" else file <> ":"
    linestr = if lineNo == -1 then "" else (show lineNo) <> ":"
    messagestr = message
  in
    if (null filestr) && (null linestr) then
       statstr <> messagestr
    else
      statstr <> filestr <> linestr <> " " <> messagestr
