module Utils where

import Prelude

import Data.Function (on)
import Data.Array (concat, concatMap, elem, filter, filterA, partition)
import Data.Array as Arr
import Data.Either (Either(..))
import Data.List (List(..), singleton)
import Data.List as L
import Data.List.NonEmpty as NL
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
import Pipes (for, yield, (>->), await, each, (>~), cat)
import Pipes.Core (Producer_, Pipe, runEffect)
import Pipes.Prelude as P


readdirStream :: String -> Producer_ FilePath Aff Unit
readdirStream x = do
  fs <- liftAff $ readdir x
  each fs

-- | get all csv files from a directory recursively, using pipes and Aff
getFiles_ :: FilePath -> Array String -> Producer_ FilePath Aff Unit
getFiles_ x excl = do
  let
    excludePaths ps = P.filter (\x -> not $ x `elem` ps)

    isCsvFile path = extname (basename path) == ".csv"

    fs = readdirStream x
      >-> excludePaths excl
      >-> P.map (\f -> Path.concat [ x, f ])

  for fs
    ( \entry -> do
        status <- liftAff $ stat entry
        when (isFile status && isCsvFile entry) (yield entry)
        when (isDirectory status) (getFiles_ entry [])
    )

-- | get all csv files from a directory recursively
getFiles :: FilePath -> Array String -> Aff (Array FilePath)
getFiles x excl = do
  fib <- attempt $ P.toListM (getFiles_ x excl)
  case fib of
    Left e -> do
      log $ "ERROR: " <> message e
      pure $ [ ]
    Right res -> pure $ Arr.fromFoldable res

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

dupsBy :: ∀ a. (a -> a -> Ordering) -> List a -> List a
dupsBy func lst =
  let
    gs = L.groupAllBy func lst

    counts = map (\x -> (Tuple (NL.head x) (NL.length x))) gs

    dups = L.filter (\x -> snd x > 1) counts
  in
    map fst dups

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
