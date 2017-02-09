<h1>Toot Sweets!</h1>

<h2>Overview</h2>
<p>A simple checkout app for a candy store written in Node.js.</p>
![alt text](https://github.com/chwinnie/toot-sweets/blob/master/public/images/demo.gif "Demo")

<h2>Installation and Running App</h2>
Run `node server.js` in the top-level directory of this repository

<h2>TODOs:</h2>
<ul>
<li>Custom checkout page rather than using Stripe's default checkout modal</li>
<li>Proper handling of cart data per session</li>
<li>Better client and server error handling</li>
  <ul>
    <li>Shouldn't take you to new page upon server error, should just show you error message on client and let you try again</li>
    <li>Known bug: client error messages are not wiped when you hit Back button</li>
  </ul>
</ul>
