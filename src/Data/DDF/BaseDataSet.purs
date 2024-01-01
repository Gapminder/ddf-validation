-- | A base dataset is a dataset which has validated concepts and entities.
-- | With concepts and entities, we can validate datapoints and synonyms.

module Data.DDF.BaseDataSet where

import Prelude
import Data.Map (Map)
import Data.Map as M
import Data.DDF.Atoms.Identifier (Identifier)
import Data.DDF.Concept (Concept)
import Data.DDF.Concept as Conc
import Data.DDF.Entity (Entity)
import Data.DDF.Entity as Ent
import Utils (dupsBy)
import Data.List (List, groupBy, null)
import Data.Tuple (Tuple(..))
import Data.Function (on)
import Data.Validation.Issue (Issues, Issue(..))
import Data.Validation.Semigroup (V, andThen, invalid, isValid, toEither)
import Data.List.NonEmpty as NL

-- Use a dictionary for data, make it easier to query.
type ConceptDict = Map Identifier Concept

type EntityDict = Map Identifier (Map Identifier Entity)

data BaseDataSet = BaseDataSet
  { concepts :: ConceptDict
  , entities :: EntityDict
  }

instance showBaseDataSet :: Show BaseDataSet where
  show (BaseDataSet { concepts, entities }) =
    "concepts: \n"
    <> show concepts
    <> "\nentities: \n"
    <> show entities

create :: ConceptDict -> EntityDict -> BaseDataSet
create concepts entities = BaseDataSet { concepts, entities }

type BaseDataSetInput =
  { concepts :: List Concept
  , entities :: List Entity
  }

convertConceptInput :: List Concept -> ConceptDict
convertConceptInput lst = M.fromFoldable $ map (\c -> (Tuple (Conc.getId c) c)) lst

convertEntityInput :: List Entity -> EntityDict
convertEntityInput lst =
  let
    compareEntity a b = Ent.getDomain a == Ent.getDomain b
    groups = groupBy compareEntity lst

    entToTuple e = Tuple (Ent.getId e) e
    groupToTuple g = Tuple (Ent.getDomain $ NL.head g) g
    -- 1. convert List to Map DomainId (List Entity)
    groupsMap = M.fromFoldable $ map groupToTuple groups
    -- 2. convert Map DomainId (List Entity) to
    -- Map Domain (List (Tuple EntityId Entity))
    groupsMapWithTuple = map (\es -> map entToTuple es) groupsMap
  in
    -- map M.fromFoldable $ groupsMapWithTuple
   map M.fromFoldable $ groupsMapWithTuple

parseBaseDataSet :: BaseDataSetInput -> V Issues BaseDataSet
parseBaseDataSet input =
  let
    -- TODO: add more checkings
    conceptDict = convertConceptInput input.concepts
    entityDict = convertEntityInput input.entities
  in
    create
      <$> pure conceptDict
      <*> pure entityDict


-- Warnings
--
duplicatedConcept :: BaseDataSetInput -> V Issues Unit
duplicatedConcept { concepts, entities } =
  case null dups of
    true -> pure unit
    false -> invalid [ Issue $ "multiple definition found for " <> show dups ]
  where
    dups = dupsBy (compare `on` Conc.getId) concepts

duplicatedEntity :: BaseDataSetInput -> V Issues Unit
duplicatedEntity { concepts, entities } =
  case null dups of
    true -> pure unit
    false -> invalid [ Issue $ "multiple definition found for " <> show dups ]
  where
    dups = dupsBy (compare `on` Ent.getDomainAndId) entities
