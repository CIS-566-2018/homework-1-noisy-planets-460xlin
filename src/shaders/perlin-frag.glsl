#version 300 es

// This is a fragment shader. If you've opened this file first, please
// open and read lambert.vert.glsl before reading on.
// Unlike the vertex shader, the fragment shader actually does compute
// the shading of geometry. For every pixel in your program's output
// screen, the fragment shader is run for every bit of geometry that
// particular pixel overlaps. By implicitly interpolating the position
// data passed into the fragment shader by the vertex shader, the fragment shader
// can compute what color to apply to its pixel based on things like vertex
// position, light position, and vertex color.
precision highp float;

uniform vec4 u_Color; // The color with which to render this instance of geometry.
uniform float u_TerH;
// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;

in float fs_offset;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

vec3 snow = vec3(1.);
vec3 dirt = vec3(0.5, 0.54, 0.53);
vec3 grass = vec3(0.24, 0.57, 0.25);
vec3 sand = vec3(1., 0.92, 0.84);


void main()
{
    // Material base color (before shading)

    

        // Calculate the diffuse term for Lambert shading
        float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));
        // Avoid negative lighting values
        //diffuseTerm = clamp(diffuseTerm, 0, 1);
        float color_offset = 0.;
        vec3 tempColor = vec3(0.);
        if(fs_offset > 0.5)
        {
            color_offset = smoothstep(0.6, 1., fs_offset);
            tempColor = mix(snow, vec3(1.), color_offset);
            
        }
        else if((fs_offset <= 0.5) && (fs_offset > 0.4))
        {
            color_offset = smoothstep(0.6, 0.8, fs_offset);
            tempColor = mix(dirt, snow, color_offset);
        }
        else if((fs_offset <= 0.4) && (fs_offset > 0.2))
        {
            color_offset = smoothstep(0.2, 0.6, fs_offset);
            tempColor = mix(grass, dirt, color_offset);
        }
        else if((fs_offset <= 0.2) && (fs_offset > 0.0))
        {
            color_offset = smoothstep(0., 0.2, fs_offset);
            tempColor = mix(sand, grass, color_offset);           
        }

        vec4 diffuseColor = vec4(tempColor,1);


        float ambientTerm = 0.2;

        float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                            //to simulate ambient lighting. This ensures that faces that are not
                                                            //lit by our point light are not completely black.

        // Compute final shaded color
        out_Col = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a);
}
