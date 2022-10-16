module Data.DDF.DataSet where

import Prelude
import Data.Array as Arr
import Data.Array.NonEmpty (NonEmptyArray)
import Data.Array.NonEmpty as NArr
import Data.DDF.Concept (Concept(..), ConceptType(..), getId)
import Data.DDF.Concept as Conc
import Data.DDF.Entity (Entity(..))
import Data.DDF.Entity as Ent
import Data.DDF.FileInfo (FileInfo(..))
import Data.DDF.Identifier (Identifier)
import Data.DDF.Identifier as Id
import Data.DDF.Validation.Result (Errors, Error(..))
import Data.DDF.Validation.Result as Res
import Data.DDF.Validation.ValidationT (Validation, vWarning)
import Data.Either (Either(..))
import Data.List (List, (:))
import Data.List as L
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

type ConceptDict
  = Map Identifier Concept

type EntityDict
  = Map Identifier (Map Identifier Entity)

-- FIXME: We should have a DataSetInput data
-- and DataSet data is for valid datasets.
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
addConcept :: Concept -> DataSet -> V Errors DataSet
addConcept conc (DataSet ds) = case concExisted of
  true -> invalid [ Error $ "concept " <> Id.value cid <> " existed in dataset" ]
  false -> pure newds
    where
    newds = DataSet $ ds { concepts = newconcepts }

    newconcepts = M.insert cid conc ds.concepts
  where
  cid = Conc.getId conc

  concExisted = M.member cid ds.concepts

checkConceptExist :: Identifier -> DataSet -> V Errors Unit
checkConceptExist id ds@(DataSet dsrec) =
  if (not $ hasConcept ds id) then
    invalid [ Error $ "concept " <> Id.value id <> " not exists in dataset" ]
  else
    pure unit

checkConceptId :: DataSet -> V Errors DataSet
checkConceptId ds@(DataSet dsrec) = ado
  sequence $ map (Id.isLongerThan64Chars) $ L.fromFoldable $ M.keys dsrec.concepts
  in ds

checkDomainExists :: Identifier -> DataSet -> V Errors Unit
checkDomainExists d (DataSet ds) =
  if M.member d ds.entities then
    pure unit
  else
    invalid [ Error $ "domain " <> Id.value d <> " does not exist in the dataset" ]

checkDomainForEntitySets :: DataSet -> V Errors DataSet
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

appendEntityToList :: Entity -> Map Identifier Entity -> V Errors (Map Identifier Entity)
appendEntityToList ent@(Entity e) es = case M.lookup e.entityId es of
  Just (Entity e') ->
    if (L.length $ L.intersect e.entitySets e'.entitySets) > 0 then
      invalid [ Error $ "duplicated defeintion of " <> (Id.value $ e.entityId) <> " in domain " <> Id.value e.entityDomain ]
    else
      let
        newSets = e.entitySets <> e'.entitySets

        newE = Entity $ e' { entitySets = newSets }
      in
        pure $ M.insert e.entityId newE es
  Nothing -> pure $ M.insert e.entityId ent es

-- | add entity to Dataset, will fail when same entity exists
addEntity :: Entity -> DataSet -> V Errors DataSet
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
