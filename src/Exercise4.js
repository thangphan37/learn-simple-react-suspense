import React, { Suspense } from 'react';
import createResource from './Exercise1';
import { ErrorBoundary } from 'react-error-boundary'
let promiseCommon = id => fetch(`https://jsonplaceholder.typicode.com/users/${id}`).then(r => r.json());

function RobotForm({
  robotName: externalRobotName,
  initialRobotName = externalRobotName || '',
  onSubmit
}) {
  const [robotName, setRobotName] = React.useState(initialRobotName);

  React.useEffect(() => {
    if (typeof externalRobotName === 'string') {
      setRobotName(externalRobotName);
    }
  }, [externalRobotName]);

  function handleChange(event) {
    setRobotName(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(robotName)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={robotName}
        placeholder={'Robot Name...'}
        onChange={handleChange}
      />
      <button type="submit" disabled={!robotName}>Submit</button>
    </form>
  )
}

function RobotInfor({ robotResource }) {
  const robot = robotResource.read();
  const { id, username, email } = robot;

  return (
    <div>
      <img src={`https://robohash.org/${id}?size=254x254`} alt='robot' />
      <div>{username}</div>
      <div>{email}</div>
    </div>
  )
}

function RobotFallback() {
  return (
    <div>
      <img src={'https://react-suspense.netlify.app/img/pokemon/fallback-pokemon.jpg'} alt='robot-fallback' />
    </div>
  )
}

function ErrorFallBack({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

function RobotErrorBoundary(props) {
  return (
    <ErrorBoundary
      fallbackRender={childProps => <ErrorFallBack {...childProps} />}
      {...props}
    />
  )
}

const SUSPENSE_CONFIG = {
  timeoutMs: 4000
}

const RobotResourceCacheContext = React.createContext();

function RobotCacheProvider({children, cacheTime}) {
  const cache = React.useRef({});
  const expirations = React.useRef({});

  React.useEffect(() => {
    const interval = setInterval(() => {
      for(const [name, time] of Object.entries(expirations.current)) {
        if(time < Date.now()) {
          delete cache.current[name];
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  })

  const getRobotResource = React.useCallback((name) => {
    // const lowerName = name.toLowerCase();
    let resource = cache.current[name];
    if(!resource) {
      resource = createResource(promiseCommon(name));
      cache.current[name] = resource
    }

    expirations.current[name] = Date.now() + cacheTime
    return resource;
  }, [cacheTime]);

  return (
    <RobotResourceCacheContext.Provider value={getRobotResource}>
      {children}
    </RobotResourceCacheContext.Provider>
  )
}

function useRobotResourceCacheContext() {
  return React.useContext(RobotResourceCacheContext);
}

function App() {
  const [robotName, setRobotName] = React.useState('');
  const [robotResource, setRobotResource] = React.useState(null);
  const [startTransition, isPending] = React.unstable_useTransition(SUSPENSE_CONFIG);
  const getRobotResource = useRobotResourceCacheContext();

  function onSubmit(newRobotName) {
    setRobotName(newRobotName);
  }

  React.useEffect(() => {
    if (!robotName) {
      setRobotResource(null);
    } else {
      const ids = [0,1,2,3,4,5,6,7,8,9];
      ids.forEach((id, i) => {
        const j = Math.floor(Math.random()*i);
        [ids[i], ids[j]] = [ids[j], ids[i]];
      });

      startTransition(() => {
        const source = getRobotResource(ids[0]);
        setRobotResource(source);
      })
    }
  }, [getRobotResource, robotName, startTransition]);

  return (
    //should use a className to deplay status pending for case resource load too fast.
    <div style={{opacity: isPending ? 0.6: 1}}>
      <h2>Exercise4</h2>
      <RobotForm onSubmit={onSubmit} robotName={robotName} />
      <RobotErrorBoundary onReset={() => setRobotName('')} resetKeys={[robotResource]}>
        {
          robotResource ? <Suspense fallback={<RobotFallback />}>
            <RobotInfor robotResource={robotResource} />
          </Suspense> : null
        }
      </RobotErrorBoundary>
    </div>
  )
}

function Exercise4() {
  return (
    <RobotCacheProvider cacheTime={5000}>
      <App />
    </RobotCacheProvider>
  )
}

export {
  Exercise4
}