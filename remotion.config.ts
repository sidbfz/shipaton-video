import {Config} from '@remotion/cli/config';

// Source media stays untouched in assets/ and is served as the public dir.
Config.setPublicDir('./assets');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');

// Optional: use an already-installed Chromium / headless shell instead of
// letting Remotion download one (e.g. in sandboxed CI).
if (process.env.BROWSER_EXECUTABLE) {
	Config.setBrowserExecutable(process.env.BROWSER_EXECUTABLE);
}
