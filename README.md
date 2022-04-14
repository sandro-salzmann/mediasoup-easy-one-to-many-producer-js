# mediasoup-easy-one-to-many-producer-js

Video producer of an easy to use one-to-many broadcasting tool based on mediasoup.

## Installation

```sh
npm install mediasoup-easy-one-to-many-producer-js
```

## Getting started

Call `useProduce` to setup a producer using your options. `useProduce` will return functions that let you establish the connection to the mediasoup router (`connect`) and start publishing a stream (`publish`).

```ts
import { useProduce } from "mediasoup-easy-one-to-many-producer-react";

const { connect, publish } = useProduce({
    url: "https://example.com:3014",
});

// ...
connect() // initialize the connection to the mediasoup router
// ...
publish() // start publishing a stream
// ...
```

## API

### useProduce(options: ProduceOptions)

Returns functions for connecting to the [server](https://github.com/sandro-salzmann/mediasoup-easy-one-to-many-server) and publishing a video stream.

**ProduceOptions**

| Field & Type        | Description                                                                                                                        | Required | Default |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| url <br /> *string* | URL of the [server](https://github.com/sandro-salzmann/mediasoup-easy-one-to-many-server) where the mediasoup router is running on | Yes      |         |
