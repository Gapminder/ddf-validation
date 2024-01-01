-- | NOTE: This module is depercated and will be replaced by Data.DDF.BaseDataSet.

module Data.DDF.DataSet where

import Prelude
import Data.Function (on)
import Data.Array as Arr
import Data.Array.NonEmpty (NonEmptyArray)
import Data.Array.NonEmpty as NArr
import Data.DDF.Concept (Concept(..), ConceptType(..), getId)
import Data.DDF.Concept as Conc
import Data.DDF.Csv.CsvFile (CsvFile(..))
import Data.DDF.Entity (Entity(..))
import Data.DDF.Entity as Ent
import Data.DDF.Csv.FileInfo (FileInfo(..))
import Data.DDF.Atoms.Identifier (Identifier)
import Data.DDF.Atoms.Identifier as Id
import Data.Validation.Issue (Issues, Issue(..))
import Data.Validation.ValidationT (Validation, vWarning)
import Data.Either (Either(..))
import Data.List (List, (:))
import Data.List as L
import Data.List.NonEmpty as NL
import Data.Map (Map(..))
import Data.Map as M
import Data.Maybe (Maybe(..), fromJust)
import Data.Newtype (unwrap)
import Data.NonEmpty (NonEmpty)
import Data.Set (Set)
import Data.Set as Set
import Data.String.NonEmpty.Internal (NonEmptyString(..), toString)
import Data.Traversable (sequence)
import Data.Tuple (Tuple(..), fst, snd)
import Data.Validation.Semigroup (V, andThen, invalid, isValid, toEither)
import Partial.Unsafe (unsafePartial)
import Utils (dupsBy)


-- Use a dictionary for data, make it easier to query.
type ConceptDict
  = Map Identifier Concept

type EntityDict
  = Map Identifier (Map Identifier Entity)

data DataSet
  = DataSet
    { concepts :: ConceptDict
    , entities :: EntityDict
    }

-- | create empty dataset
empty :: DataSet
empty =
  DataSet
    { concepts: M.empty
    , entities: M.empty
    }

conceptsStr :: DataSet -> Set Identifier
conceptsStr (DataSet ds) = M.keys ds.concepts

getConcepts :: DataSet -> ConceptDict
getConcepts (DataSet { concepts }) = concepts

getConceptWithType :: ConceptType -> DataSet -> ConceptDict
getConceptWithType ct (DataSet { concepts }) = M.filterWithKey sameType concepts
  where
  sameType _ (Concept c) = c.conceptType == ct

hasConcept :: DataSet -> Identifier -> Boolean
hasConcept (DataSet ds) conc = M.member conc ds.concepts

-- functions to add stuffs to a dataset
-- | add concept to Dataset, will fail when concept exists.
addConcept :: Concept -> DataSet -> V Issues DataSet
addConcept conc (DataSet ds) = case concExisted of
  true -> invalid [ Issue $ "concept " <> Id.value cid <> " existed in dataset" ]
  false -> pure newds
    where
    newds = DataSet $ ds { concepts = newconcepts }

    newconcepts = M.insert cid conc ds.concepts
  where
  cid = Conc.getId conc

  concExisted = M.member cid ds.concepts

checkConceptExist :: Identifier -> DataSet -> V Issues Unit
checkConceptExist id ds@(DataSet dsrec) =
  if (not $ hasConcept ds id) then
    invalid [ Issue $ "concept " <> Id.value id <> " not exists in dataset" ]
  else
    pure unit

checkConceptId :: DataSet -> V Issues DataSet
checkConceptId ds@(DataSet dsrec) = ado
  sequence $ map (Id.isLongerThan64Chars) $ L.fromFoldable $ M.keys dsrec.concepts
  in ds

checkDomainExists :: Identifier -> DataSet -> V Issues Unit
checkDomainExists d (DataSet ds) =
  if M.member d ds.entities then
    pure unit
  else
    invalid [ Issue $ "domain " <> Id.value d <> " does not exist in the dataset" ]

checkDomainForEntitySets :: DataSet -> V Issues DataSet
checkDomainForEntitySets ds@(DataSet dsrec) =
  let
    isEntityConcept (Concept c)
      | c.conceptType == EntitySetC = true
      | otherwise = false

    entitysetConcepts = L.filter isEntityConcept $ M.values dsrec.concepts

    getDomain (Concept c) = unsafePartial $ fromJust $ M.lookup (Id.unsafeCreate "domain") c.props

    check e = Id.parseId (getDomain e) `andThen` (\cid -> checkConceptExist cid ds)
  in
    ado
      sequence $ map (\e -> check e) entitysetConcepts
      in ds

getEntitiesFromDomain :: Identifier -> DataSet -> Map Identifier Entity
getEntitiesFromDomain id (DataSet ds) = case M.lookup id ds.entities of
  Just m -> m
  Nothing -> M.empty

appendEntityToList :: Entity -> Map Identifier Entity -> V Issues (Map Identifier Entity)
appendEntityToList ent@(Entity e) es = case M.lookup e.entityId es of
  Just (Entity e') ->
    if (L.length $ L.intersect e.entitySets e'.entitySets) > 0 then
      invalid [ Issue $ "duplicated defeintion of " <> (Id.value $ e.entityId) <> " in domain " <> Id.value e.entityDomain ]
    else
      let
        newSets = e.entitySets <> e'.entitySets

        newE = Entity $ e' { entitySets = newSets }
      in
        pure $ M.insert e.entityId newE es
  Nothing -> pure $ M.insert e.entityId ent es

-- | add entity to Dataset, will fail when same entity exists
addEntity :: Entity -> DataSet -> V Issues DataSet
addEntity ent@(Entity entrec) ds@(DataSet dsrec) =
  let
    domain = entrec.entityDomain

    ents = getEntitiesFromDomain domain ds
  in
    ado
      -- step1: check if domain and sets are valid
      checkConceptExist domain ds
      sequence $ map (\s -> checkConceptExist s ds) entrec.entitySets
      -- step2: check if the entity existed in the domain
      -- if not, add the entity to it
      newEntities <- appendEntityToList ent ents
      -- step3: append to DataSet
    in DataSet $ dsrec { entities = M.insert domain newEntities dsrec.entities }

-- | unvalidated DataSet, in the form of DDF objects.
data DataSetInput
  = DataSetInput
    { concepts :: List Concept
    , entities :: List Entity
    }

-- Which checking do we need here?
-- 1. Check if concept/entity definition are duplicated.
-- 2. check for non concept headers
-- 3. check incorrect boolean value (?) in entities  -> This is done in Entity.purs
-- 4. check if is--entity_set headers and their values correct
-- decided, don't mess with csv file here, just use DataSetInput' as input
duplicatedConcept :: DataSetInput -> V Issues Unit
duplicatedConcept (DataSetInput { concepts, entities }) =
  case L.null dups of
    true -> pure unit
    false -> invalid [ Issue $ "multiple definition found for " <> show dups ]
  where
    dups = dupsBy (compare `on` Conc.getId) concepts

duplicatedEntity :: DataSetInput -> V Issues Unit
duplicatedEntity (DataSetInput { concepts, entities }) =
  case L.null dups of
    true -> pure unit
    false -> invalid [ Issue $ "multiple definition found for " <> show dups ]
  where
    dups = dupsBy (compare `on` Ent.getDomainAndId) entities


-- | parse DataSet from DataSetInput
-- step 1. load concept files
-- step 2. load entities files
-- parseDataSet :: DataSetInput -> DataSet
-- parseDataSet dsi@(DataSetInput { concepts, entities }) = undefined
