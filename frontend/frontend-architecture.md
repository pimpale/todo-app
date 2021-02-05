# Frontend Architecture

This document goes over some of the more difficult points of the code of todo-app.

### Asynchronous network calls.

todo-app must communicate with the backend to render persisted data, or submit data to persist.
Our app uses standard POST requests over HTTP to communicate, as we don't require any special functionality.

In JavaScript, there are two ways to submit data:
* `XMLHttpRequest` [documentation](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest)
* `fetch` [documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

`fetch` is newer, introduced in ES6, and we chose to use this in todo-app, since it has a more modern API and supports JavaScript Promises.
However, you will never have to use fetch directly in todo-app. 
Any time you need to make a request to the backend, call a function in [src/utils/utils.ts].
Doing it this way type checks all arguments, automatically converts results to JavaScript, and overall prevents bugs.

Note that many of these functions use the keywords `await` and `async`.
This means that they are asynchronous functions. Learn more about them [here](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await).
In a nutshell, the rule is that any call to an async function must have an `await` ahead of it to actually load the result.
Any function that makes an `async` call is itself asynchronous, and so must have the word `async` ahead of it.

Examples:
```tsx
import { sleep } from '../utils/utils';

// this function is WRONG because it doesn't call await. 
// it won't sleep at all, but will still compile
function badsleep() {
  sleep(1000);
}

// this function won't compile because it hasn't been declared async
function wontcompile() {
  await sleep(1000);
}

// this function will work as intended
async function goodsleep() {
  await sleep(1000);
}
```

### Typescript Types and error handling

todo-app uses TypeScript, not pure JavaScript. Thus, all values have compile time types.
In most cases, this is very helpful for catching bugs, as it forces us to explicitly specify all possible results of a computation.
However, it does result in some verbosity, expecially when dealing with network requests.

Let's consider the example of creating a login token, and printing the key.
```tsx
import { newValidApiKey, isApiErrorCode } from '../utils/utils';

const apiKey = await newValidApiKey({
  userEmail: values.email,
  userPassword: values.password,
  duration: 5 * 60 * 60 * 1000
});

// WRONG, will not compile
console.log(apiKey.key);
```
This example won't compile with TypeScript. 
The compiler will tell us something like `Property 'creator' does not exist on type '"OK"'`.
If you have errors like this, a good starting point is to look at the the function's type.

Let's look at the declaration of newValidApiKey:
```tsx
export async function newValidApiKey(props: NewValidApiKeyProps): Promise<ApiKey | ApiErrorCode>
```
The type of the returned value is the bit at the end: `Promise<ApiKey | ApiErrorCode>`
Breaking this expression down:
* Let's look at `Promise` 
  * All async functions have to return a `Promise`, not the actual type.
    * Learn more about this restriction here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
  * Promise documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
* The angle brackets after `Promise` specify its type parameters. 
  Generics in TypesScript work similarly to generics in java and templates in C++.
  * Generic Type documentation: https://www.typescriptlang.org/docs/handbook/generics.html 
* The part inside the angle brackets `ApiKey | ApiErrorCode`, is the type that actually gets set on the variable apiKey.
  * How come `newValidApiKey` returns `Promise<ApiKey | ApiErrorCode>` but apiKey is set to `ApiKey | ApiErrorCode`?
    * The `await` keyword removes the Promise.
      * `sleep()` has type `Promise<void>` but `await sleep()` has type `void`.
  * The bar between ApiKey and ApiErrorCode represents a union type. This essentially means "or".
    * `let x:number | string = 5;` means x can be either a number or string.
    * Learn more about Union types here: https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html 

So, we've ascertained that apiKey has type `ApiKey | ApiErrorCode`. 
We can't access it's `key` property since not all members of the union have that property, only `ApiKey`.
To fix this, we have to satisfy TypeScript's type checker by checking that it isn't an ApiErrorCode.

```tsx
import { newValidApiKey, isApiErrorCode } from '../utils/utils';

const maybeApiKey = await newValidApiKey({
  userEmail: values.email,
  userPassword: values.password,
  duration: 5 * 60 * 60 * 1000
});

if(isApiErrorCode(maybeApiKey)) {
  console.log("Error!");
} else {
  console.log(apiKey.key);
}

```
This example does what is intended.
As an added bonus, we also, by satisfying the compiler, handled the error correctly and display an error message.

### Using React-Async to render asynchronous data
In a pure TypeScript function, you could do this to fetch data from the backend:
```tsx
import { viewApiKey, isApiErrorCode } from '../utils/utils';

async function Foo(apiKey:ApiKey) {
  const maybeApiKeys = await viewApiKey({
    apiKey:apiKey.key
  });
  
  // bail early on error
  if(isApiErrorCode(maybeApiKeys)) {
    console.log("error");
    return;
  }
  
  // logs each key
  maybeApiKeys.foreach(ak => console.log(ak.keys));
}

```

However, this doesn't work in React:


```tsx
import { viewApiKey, isApiErrorCode } from '../utils/utils';

async function Foo(apiKey:ApiKey) {
  const maybeApiKeys = await viewApiKey({
    apiKey:apiKey.key
  });
  
  if(isApiErrorCode(maybeApiKeys)) {
    return <p>Error!</p>
  } else {
    return <ul>{maybeApiKeys.map(ak => <li>ak.key</li>)}</ul>
  }
}

```

While this compiles just fine, it will throw a runtime exception.
This is because all async functions return a `Promise`.
React can only render a `ReactNode`, and has no idea what to do with a `Promise<ReactNode>`.

This problem, unfortunately, has no out of the box solutions.
We'll have to include the React-Async library ([documentation](https://github.com/async-library/react-async)).
While React-Async has a lot of functionality, the piece we're most interested in is the <Async> Element.
Let's look at a wor
