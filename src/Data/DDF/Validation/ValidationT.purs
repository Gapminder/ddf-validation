module Data.DDF.Validation.ValidationT where

import Prelude

import Control.Monad.Except (class MonadTrans, ExceptT, lift, runExceptT, throwError)
import Control.Monad.State (StateT, modify_, runStateT)
import Data.DDF.Validation.Result (Errors)
import Data.Either (Either(..))
import Data.Identity (Identity)
import Data.Maybe (Maybe(..))
import Data.Newtype (class Newtype)
import Data.Tuple (Tuple(..))
import Effect (Effect)
import Effect.Class.Console (logShow, log)

-- learn from https://hackage.haskell.org/package/validationt-0.3.0/

newtype ValidationT e m a
  = ValidationT (ExceptT e (StateT e m) a)

derive instance newtypeV :: Newtype (ValidationT e m a) _

instance monadtransV :: MonadTrans (ValidationT e) where
  lift = ValidationT <<< lift <<< lift

derive newtype instance functorV :: Functor m => Functor (ValidationT e m)

derive newtype instance applyV :: Monad m => Apply (ValidationT e m)

derive newtype instance applicativeV :: Monad m => Applicative (ValidationT e m)

derive newtype instance monadV :: Monad m => Monad (ValidationT e m)

derive newtype instance bindV :: Monad m => Bind (ValidationT e m)

-- | Returns 'mempty' instead of error if no warnings have occurred.
-- Returns 'Nothing' as the second element of tuple if computation was
-- interrupted by 'vError'.
--
-- Returns all concatenated errors and warnings and the result if no
-- errors have occurred (warnings could have occurred).
runValidationT :: forall e m a. Monad m => Monoid e => ValidationT e m a -> m (Tuple e (Maybe a))
runValidationT (ValidationT m) = do
  Tuple res warnings <- runStateT (runExceptT m) mempty
  pure
    $ case res of
        Left err -> Tuple (err <> warnings) Nothing
        Right a -> Tuple warnings (Just a)


-- | Like 'runValidationT' but doesn't return the result
-- if any warning has occurred.
runValidationTEither ::
  forall e m a.
  Monoid e =>
  Eq e =>
  Monad m =>
  ValidationT e m a ->
  m (Either e a)
runValidationTEither action = do
  (Tuple err res) <- runValidationT action
  pure
    $ case res of
        Just a
          | err == mempty -> Right a
        _ -> Left err

-- | Like 'runValidationTEither', but takes an error handler instead of
-- returning errors and warnings.
-- handleValidationT
--   :: (Monoid e, Monad m, Eq e)
--   => (e -> m a)
--   -> ValidationT e m a
--   -> m a
-- handleValidationT handler action =
--   runValidationTEither action >>= either handler return

-- | Stops further execution and appends the given error.
vError :: forall e m a. Monad m => e -> ValidationT e m a
vError e = ValidationT $ throwError e

-- | Does not stop further execution and appends the given warning.
vWarning :: forall e m. Monad m => Monoid e => e -> ValidationT e m Unit
vWarning e = ValidationT $ modify_ (\x -> x <> e)

-- Alias
type Validation e a
  = forall m. Monad m => ValidationT e m a