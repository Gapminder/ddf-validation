module Data.DDF.Internal where

import Node.Path (FilePath)

-- | ItemInfo is the additional info to carry with an item (e.g Concept)
type ItemInfo =
  { filepath :: FilePath
  , row :: Int
  }
