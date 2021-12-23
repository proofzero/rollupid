# bzl/rapper.bzl

load("@bazel_skylib//lib:paths.bzl", "paths")
load("@bazel_skylib//lib:shell.bzl", "shell")

# Supported input formats. This is a dict rather than a list because it
# is easier to check for set membership with dict.get() (which never errors) than
# list.index() (which errors if the element isn't present).
input_formats = {
    # RDF/XML (default)
    "rdfxml": "rdfxml",
    # N-Triples
    "ntriples": "ntriples",
    # Turtle Terse RDF Triple Language
    "turtle": "turtle",
    # TriG - Turtle with Named Graphs
    "trig": "trig",
    # RSS Tag Soup
    "rss-tag-soup": "rss-tag-soup",
    # Gleaning Resource Descriptions from Dialects of Languages
    "grddl": "grddl",
    # Pick the parser to use using content type and URI
    "guess": "guess",
    # RDF/A via librdfa
    "rdfa": "rdfa",
    # RDF/JSON (either Triples or Resource-Centric)
    "json": "json",
    # N-Quads
    "nquads": "nquads",
}

# Supported output formats and their extensions:
output_formats = {
    # N-Triples (default)
    "ntriples": "nt",
    # Turtle Terse RDF Triple Language
    "turtle": "ttl",
    # RDF/XML (XMP Profile)
    "rdfxml-xmp": "xml",
    # RDF/XML (Abbreviated)
    "rdfxml-abbrev": ".abbrev.xml",
    # RDF/XML
    "rdfxml": ".rdf.xml",
    # RSS 1.0
    "rss-1.0": "rss",
    # Atom 1.0
    "atom": "atom",
    # GraphViz DOT format
    "dot": "dot",
    # RDF/JSON Triples
    "json-triples": "json3",
    # RDF/JSON Resource-Centric
    "json": "rdf.json",
    # HTML Table
    "html": "html",
    # N-Quads
    "nquads": "nq",
}

def rdf_converter(name, in_file, in_format, out_format, visibility=None):
    # Default input format if not specified is "turtle".
    if in_format == None:
        in_format = "turtle"
        print(
            "using default input format {fmt} for {path}".format(
                fmt=in_format,
                path=paths.basename(in_file),
            )
        )
    # Default output format if not specified is "nquads".
    if out_format == None:
        out_format = "nquads"
        print(
            "using default output format {fmt} for {path}".format(
                fmt=out_format,
                path=paths.basename(in_file),
            )
        )

    if input_formats.get(in_format) == None:
        fail("invalid input format {0}".format(in_format))
    if output_formats.get(out_format) == None:
        fail("invalid output format {0}".format(out_format))

    out_base = paths.replace_extension(in_file, "")
    out_ext = output_formats.get(out_format)
    out_file = "{base}.{ext}".format(base=out_base, ext=out_ext)

    cmd = "$(location //bzl:rapper.sh) {in_format} $< {out_format} $@".format(
        in_format = in_format,
        out_format = out_format,
    )

    native.genrule(
        name = name,
        srcs = [in_file],
        outs = [out_file],
        cmd = cmd,
        tools = [
            "//bzl:rapper.sh",
        ],
        visibility = visibility,
    )
