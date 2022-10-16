module Utils where

import Prelude

import Data.Array (concat, concatMap, elem, filter, filterA, partition)
import Data.Either (Either(..))
import Data.List (List(..), singleton)
import Data.Maybe (Maybe(..))
import Data.String (Pattern(..), joinWith)
import Data.Traversable (sequence, traverse)
import Data.Tuple (fst)
import Effect (Effect)
import Effect.Aff (Aff, attempt, launchAff, launchAff_, message)
import Effect.Class.Console (log, logShow)
import Node.Encoding (Encoding(..))
import Node.FS.Stats (isDirectory, isFile)
import Node.FS.Sync (readTextFile, readdir, writeTextFile, stat)
import Node.Path (FilePath, basename, extname)
import Node.Path as Path

getFiles :: FilePath -> Array (String) -> Effect (Array FilePath)
getFiles x excludes = do
  fs <- readdir x
  let
    folderFilter f = not $ f `elem` excludes

    fsMinusExcludes = filter folderFilter fs

    fsFullPath = map (\f -> Path.concat [ x, f ]) fsMinusExcludes
  files <-
    filterA
      ( \f ->
          (&&)
            <$> (isFile <$> stat f)
            <*> pure (extname (basename f) == ".csv")
      )
      fsFullPath
  dirs <- filterA (\f -> isDirectory <$> stat f) fsFullPath
  fsInDirs <- concat <$> traverse (\d -> getFiles d []) dirs
  pure $ files <> fsInDirs

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
