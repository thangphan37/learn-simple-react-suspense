import React, {Suspense} from 'react';
/*
  Basic Idea Suspense API: request before we even render the app.
  function Component() {
    if(data) {
      return <div>{data.message}</div>
    }

    throw promise;
  }

  ReactDOM.createRoot(rootEl).render(
    <React.Suspense fallback={<div>loading...</div>}>
      <Component/>
    </React.Suspense>
  )
 */

class ErrorBoundary extends React.Component {
  state = {
    hasError: false
  };

  static getDerivedStateFromError(error) {
    return {hasError: true};
  }

  render() {
    if(this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

let robot;
let robotPromise;
let robotError;
let promiseCommon = fetch(`https://jsonplaceholder.typicode.com/users/1`).then(r => r.json());

robotPromise = promiseCommon
  .then(
    r => {setTimeout(() => {robot = r}, 2000)},
    e => robotError = e
  );

export default function createResource(promise) {
  let status = 'pending';

  let result = promise.then(
    r => {
      setTimeout(() => {
        status = 'success';
        result = r;
      }, 2000);
    },
    e => {
      status = 'error';
      result = e;
    }
  );

  return {
    read() {
      if(status === 'pending') {
        throw result;
      } else if(status === 'success') {

        return result;
      } else {
        throw result;
      }

    }
  }
}

function Robot() {
  if(robotError) {
    throw robotError;
  }

  if(!robot) {
    throw robotPromise;
  }

  return <img src={`https://robohash.org/${robot.id}?size=200x200`} alt={'robot'}/>;
}

const resource = createResource(promiseCommon);

function RobotRefactor() {
  const robot = resource.read();

  return <img src={`https://robohash.org/${robot.id}?size=200x200`} alt={'robot'}/>;
}

function Exercise1() {
  return (
    <>
      <h2>Exercise1</h2>
      <ErrorBoundary fallback={<h2>Could not fetch robot.</h2>}>
        <Suspense fallback={<div>Loading Robot...</div>}>
          <Robot />
          <RobotRefactor />
        </Suspense>
      </ErrorBoundary>
    </>
  )
}

export {
  Exercise1
}