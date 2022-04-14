import mediasoup, { Device } from "mediasoup-client";
import { RtpCapabilities } from "mediasoup-client/lib/RtpParameters";
import { io } from 'socket.io-client';

process.env.DEBUG = "mediasoup*"; // for testing purposes

type ProduceOptions = {
    url: string
}

export const useProduce = (options: ProduceOptions) => {
    let device: mediasoup.Device;

    const socket = io(`${options.url}/mediasoup`);

    const connect = () => {
        socket.on("connect_error", (err) => {
            console.error(err)
        })
        socket.on("connect_timeout", (err) => {
            console.error(err)
        })
        socket.on("connect", () => {
            socket.emit("getRouterRtpCapabilities", (rtpCapabilities: RtpCapabilities) => {
                loadDevice(rtpCapabilities);
            });
        });
        socket.connect();
    }

    const loadDevice = async (routerRtpCapabilities: RtpCapabilities) => {
        try {
            device = new Device();
        } catch (error: any) {
            console.log(error)
            if (error.name === "UnsupportedError") {
                console.log("Browser not supported!");
            }
        }

        try {
            await device.load({ routerRtpCapabilities });
        } catch (error) {
            console.log(error);
        }
    };

    const publish = () => {
        socket.emit("createProducerTransport", (res: any) => {
            if (res.ok) {
                onProducerTransportCreated(res.params);
            } else {
                console.error(res.msg, res.error);
            }
        });
    };

    const onProducerTransportCreated = async (params: mediasoup.types.TransportOptions) => {
        const transport = device.createSendTransport(params);

        transport.on("connectionstatechange", (state) => {
            switch (state) {
                case "connecting":
                    break;
                case "connected":
                    break;
                case "failed":
                    transport.close();
                    break;
                default:
                    break;
            }
        });

        transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
            socket.emit("connectProducerTransport", dtlsParameters, () => {
                callback();
            });
        });

        transport.on(
            "produce",
            async ({ kind, rtpParameters }, callback, errback) => {
                socket.emit("produce", { kind, rtpParameters }, (producerId: string) => {
                    callback(producerId);
                });
            }
        );

        let stream: MediaStream | undefined;
        try {
            stream = await getUserMedia();
            if (stream) {
                const track = stream.getVideoTracks()[0];
                const params = { track };

                await transport.produce(params);
            } else {
                console.error("Failed to get stream")
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getUserMedia = async () => {
        if (!device.canProduce("video")) {
            console.error("Device can't produce video");
            return;
        }

        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (error) {
            console.error(error);
            throw error;
        }

        return stream;
    };

    return { connect, publish }
}
