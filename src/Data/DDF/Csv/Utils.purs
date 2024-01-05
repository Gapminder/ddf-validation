module Data.DDF.Csv.Utils
  ( CsvRowRec
  , createConceptInput
  , createEntityInput
  , createDataPointInput
  ) where

import Prelude
import Data.Array.NonEmpty (NonEmptyArray)
import Data.Array.NonEmpty as NEA
import Data.Array as A
import Data.Array.NonEmpty.Internal (NonEmptyArray(..))
import Data.DDF.Atoms.Header (Header(..))
import Data.DDF.Atoms.Identifier as Id
import Data.Validation.Issue (Issue(..), Issues)
import Data.Csv (CsvRow(..))
import Data.DDF.Csv.CsvFile (CsvFile)
import Data.DDF.Csv.FileInfo (FileInfo(..))
import Data.DDF.Csv.FileInfo as FI
import Data.DDF.Concept (ConceptInput)
import Data.DDF.Entity (EntityInput)
import Data.DDF.DataPoint (DataPointInput)
import Data.Validation.Semigroup (V, invalid)
import Data.Tuple (Tuple(..))
import Data.Map (Map)
import Data.Map as M
import Data.Map.Extra (popV, lookupV)
import Data.Maybe (Maybe(..), fromJust)
import Pipes (for, yield)
import Pipes.Core (Pipe)
import Safe.Coerce (coerce)
import Partial.Unsafe (unsafePartial)
import Data.Traversable (sequence)

-- | CsvRowRec is a valid CsvRow converted to a Map.
type CsvRowRec = Map Header String

-- Utils

rowLengthMatchesHeaders :: NonEmptyArray Header -> Array String -> V Issues Unit
rowLengthMatchesHeaders headers row =
  if NEA.length headers /= A.length row then
    invalid [ InvalidCSV $ "bad csv row" ]
  else
    pure unit

-- | create ConceptInput for Concept parsing
createConceptInput :: String -> NonEmptyArray Header -> CsvRow -> V Issues ConceptInput
createConceptInput fp headers (CsvRow (Tuple idx row)) =
  let
    conceptInput = { conceptId: _, conceptType: _, props: _, _info: _ }
    headers_ = map coerce (NEA.toArray headers)
    rowMap = M.fromFoldable $ A.zip headers_ row
    -- rowMap = M.fromFoldable $ A.zip (NEA.toArray headers) row
    props = rowMap #
      ( M.delete (Id.unsafeCreate "concept")
          >>> M.delete (Id.unsafeCreate "concept_type")
      )
    _info = Just $ { filepath: fp, row: idx }
  in
    ado
      _ <- rowLengthMatchesHeaders headers row
      conceptId <- lookupV (Id.unsafeCreate "concept") rowMap
      conceptType <- lookupV (Id.unsafeCreate "concept_type") rowMap
      in
        conceptInput conceptId conceptType props _info

-- | create EntityInput for Entity parsing
createEntityInput :: String -> FI.Ent -> NonEmptyArray Header -> CsvRow -> V Issues EntityInput
createEntityInput fp { domain, set } headers (CsvRow (Tuple idx row)) =
  let
    entityInput = { entityId: _, entityDomain: _, entitySet: _, props: _, _info: _ }
    entityCol = case set of
      Nothing -> Header domain
      Just s ->
        if (Header s) `NEA.elem` headers then
          Header s
        else
          Header domain
    propsMap = M.fromFoldable $ A.zip (NEA.toArray headers) row
    Tuple eid props = unsafePartial $ fromJust $ M.pop entityCol propsMap

    _info = Just $ { filepath: fp, row: idx }
  in
    ado
      _ <- rowLengthMatchesHeaders headers row
      in
        entityInput eid domain set props _info

-- | create DataPointInput for DataPoint parsing
createDataPointInput :: String -> FI.DP -> NonEmptyArray Header -> CsvRow -> V Issues DataPointInput
createDataPointInput fp { indicator, pkeys, constrains } headers (CsvRow (Tuple idx row)) =
  -- TODO: check constrains
  let
    datapointInput = { indicatorId: _, primaryKeys: _, primaryKeyValues: _, value: _, _info: _ }
    rowMap = M.fromFoldable $ A.zip (NEA.toArray headers) row

    _info = Just $ { filepath: fp, row: idx }
  in
    ado
      _ <- rowLengthMatchesHeaders headers row
      value <- lookupV (Header indicator) rowMap
      primaryKeyValues <- sequence $ map (\k -> lookupV (Header k) rowMap) pkeys
      in
        datapointInput indicator pkeys primaryKeyValues value _info
