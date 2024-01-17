module Utils where

import Prelude

import Data.Function (on)
import Data.Array (concat, concatMap, elem, filter, filterA, partition)
import Data.Array as Arr
import Data.Array.NonEmpty as NEA
import Data.Array.NonEmpty (NonEmptyArray)
import Data.Either (Either(..))
import Data.List (List(..), singleton)
import Data.List as L
import Data.List.NonEmpty as NEL
import Data.Maybe (Maybe(..))
import Data.String (Pattern(..), joinWith)
import Data.Traversable (sequence, traverse)
import Data.Traversable (for) as Tra
import Data.Tuple (Tuple(..), fst, snd)
import Effect (Effect)
import Effect.Aff (Aff, attempt, launchAff, launchAff_, message, joinFiber)
import Effect.Aff.Class (liftAff)
import Effect.Class (liftEffect)
import Effect.Class.Console (log, logShow)
import Node.Encoding (Encoding(..))
import Node.FS.Stats (isDirectory, isFile)
import Node.FS.Aff (readTextFile, readdir, writeTextFile, stat)
import Node.Path (FilePath, basename, extname)
import Node.Path as Path


-- | get all csv files from a directory recursively
getFiles :: FilePath -> Array String -> Aff (Array FilePath)
getFiles x excl = do
  allFiles <- readdir x

  let
    fsToGo = Arr.filter (\f -> not $ f `elem` excl)
             >>> map (\f -> Path.concat [ x, f ])
             $ allFiles

    isCsvFile path = extname (basename path) == ".csv"

    go f st acc | (isFile st && isCsvFile f) = pure $ Arr.cons f acc
                | (isDirectory st) = do
                                     dirfs <- getFiles f [ ]
                                     pure $ acc <> dirfs
                | otherwise = pure acc

  Arr.foldM (\acc f -> do
                st <- stat f
                go f st acc) [ ] fsToGo

arrayOfRight :: forall a b. Either a b -> Array b
arrayOfRight (Right b) = [ b ]
arrayOfRight _ = []

arrayOfLeft :: forall a b. Either a b -> Array a
arrayOfLeft (Left a) = [ a ]
arrayOfLeft _ = []

listOfRight :: forall a b. Either a b -> List b
listOfRight (Right b) = singleton b
listOfRight _ = Nil

listOfLeft :: forall a b. Either a b -> List a
listOfLeft (Left a) = singleton a
listOfLeft _ = Nil

-- | Given a list, calculate duplicated items by some comparing function.
-- | return all duplicated items
dupsBy :: forall a. (a -> a -> Ordering) -> Array a -> Array a
dupsBy func lst =
  let
    gs = Arr.groupAllBy func lst
  in
    map NEA.last $ Arr.filter (\g -> NEA.length g > 1) gs

-- | Given a list, calculate duplicated items by some comparing function.
-- | return all duplicated items
dupsByL :: forall a. (a -> a -> Ordering) -> List a -> List a
dupsByL func lst =
  let
    gs = L.groupAllBy func lst
  in
    map NEL.last $ L.filter (\g -> NEL.length g > 1) gs


-- | create a counter
-- counter :: forall a. Ord a => Eq a => NonEmptyArray a -> NonEmptyArray (Tuple a Int)
-- counter xs = map (\x -> (Tuple (NArr.head x) (NArr.length x))) <<< NArr.group <<< NArr.sort $ xs
-- -- | check if there are duplicated entries in a list
-- checkDups :: forall a. Show a => Eq a => Ord a => NonEmptyArray a -> V Errors (NonEmptyArray a)
-- checkDups xs =
--   let
--     ns = counter xs
--     hasDups = NArr.filter (\x -> (snd x) > 1) ns
--   in
--     case Arr.head hasDups of
--       Nothing -> pure xs
--       Just _ -> do
--         let
--           allDups = map fst hasDups
--           msg = "duplicated entry: " <> show allDups
--         invalid [ Error msg ]
