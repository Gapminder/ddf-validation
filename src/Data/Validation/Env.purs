module Data.Validation.Env where

import Prelude

import Node.Path (FilePath)

type LineNo = Int

data ObjStat =
    BoundedObj FilePath Int
    | UnBounded
