module Data.Map.Extra where

import Prelude
import Data.FoldableWithIndex (foldlWithIndex)
import Data.List (List)
import Data.Map (Map, insert, lookup)
import Data.Map as Map
import Data.Maybe (Maybe(..), maybe)
import Data.Monoid (mempty)
import Data.Tuple (Tuple(..), uncurry)
import Data.Validation.Semigroup (V, invalid)
import Data.Validation.Issue (Issue(..), Issues)

mapKeys :: forall a k1 k2. Ord k2 => (k1 -> k2) -> Map k1 a -> Map k2 a
mapKeys = mapKeysWith (\x y -> x)

mapKeysWith :: forall a k1 k2. Ord k2 => (a -> a -> a) -> (k1 -> k2) -> Map k1 a -> Map k2 a
mapKeysWith c f m = Map.fromFoldableWith c nTuple
  where
  fFirst (Tuple x y) = (Tuple (f x) y)

  aList :: List (Tuple k1 a)
  aList = Map.toUnfoldable m

  nTuple = map fFirst aList


lookupV :: forall k v. Show k => Ord k => k -> Map k v -> V Issues v
lookupV key m = case Map.lookup key m of
  Just v -> pure v
  Nothing -> invalid [ Issue $ "key not found: " <> show key ]

popV :: forall k v. Show k => Ord k => k -> Map k v -> V Issues (Tuple v (Map k v))
popV key m = case Map.pop key m of
  Just x -> pure x
  Nothing -> invalid [ Issue $ "key not found: " <> show key ]
