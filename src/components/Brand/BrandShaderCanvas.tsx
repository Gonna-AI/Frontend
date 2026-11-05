// Static named import so the bundler tree-shakes the shader library down to the
// grain gradient alone; BrandShader lazy-loads this module.
import { GrainGradient } from '@paper-design/shaders-react';

export default GrainGradient;
