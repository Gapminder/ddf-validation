-- | Definition of Dataset
-- | Each DDF dataset defines five collections of data:
-- | Concepts, Metadata, Entities, Datapoints and Synonyms
-- | But for the purpose of this validation application,
-- | we don't have to keep all data into a Dataset object.
-- | with concepts and entities we can validate other collections
-- | so in this module we defined a BaseDataSet with only
-- | concepts and entities. And define functions to validate datapoints etc
-- | with BaseDataSet.

module Data.DDF.BaseDataSet where

import Prelude
import Data.Array as A
import Data.Map (Map)
import Data.Map as M
import Data.DDF.Atoms.Identifier (Identifier)
import Data.DDF.Atoms.Identifier as Id
import Data.DDF.Concept (Concept(..))
import Data.DDF.Concept as Conc
import Data.DDF.Entity (Entity)
import Data.DDF.Entity as Ent
import Utils (dupsBy)
import Data.List (List, groupBy, sortBy, null)
import Data.Tuple (Tuple(..))
import Data.Function (on)
import Data.Validation.Issue (Issues, Issue(..))
import Data.Validation.Semigroup (V, andThen, invalid, isValid, toEither)
import Data.List.NonEmpty as NL
import Data.Maybe (Maybe(..))

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

-- | check if there are duplicated concepts and convert them into concept input
-- | Concepts are not allowed to have duplicates in a dataset.
convertConceptInput :: List Concept -> V Issues ConceptDict
convertConceptInput lst =
  let
    dups = dupsBy (compare `on` Conc.getId) lst
  in
   if null dups then
     pure $ M.fromFoldable $ map (\c -> (Tuple (Conc.getId c) c)) lst
   else
     let
       createIssue (Concept d) =
         case d._info of
           Nothing ->
             DuplicatedItem "" (-1) $
             "multiple definition found for " <> (Id.value d.conceptId)
           Just info ->
             DuplicatedItem info.filepath info.row $
             "multiple definition found for " <> (Id.value d.conceptId)
       issues = A.fromFoldable $ map createIssue dups
     in
      invalid issues


notEmptyConcepts :: List Concept -> V Issues (List Concept)
notEmptyConcepts lst =
  if null lst then
    invalid [ Issue $ "Data set must have concepts" ]
  else
    pure lst

-- | Same Entity exists multiple times in one entity file is not allowed.
noDupsEntityPerFile :: List Entity -> V Issues (List Entity)
noDupsEntityPerFile lst =
  let
    dups = dupsBy (compare `on` Ent.getIdAndFile) lst

    createIssue (Tuple id file) = Issue $
                                  "multiple definition found for "
                                  <> (Id.value id) <> " in file: " <> file
  in
   case null dups of
     false -> invalid $ map (createIssue <<< Ent.getIdAndFile) (A.fromFoldable dups)
     true -> pure lst

convertEntityInput :: List Entity -> EntityDict
convertEntityInput lst =
  -- FIXME: merge duplicated entities come from multiple files
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
    -- check concept of poperty columns exists.
    -- check poverty values looks good.
    conceptDict = notEmptyConcepts input.concepts
                  `andThen` convertConceptInput
    entityDict = noDupsEntityPerFile input.entities
                 `andThen`
                 (\x -> pure $ convertEntityInput x)
  in
    create
      <$> conceptDict
      <*> entityDict
