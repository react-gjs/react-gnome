# Console

React GTK extends the built-in console. It enhances the printed output as well as adds a few non-standard
methods.

## console.setPretty(boolean)

By default, when in production mode this settings is disabled, and enabled in the development mode.
This setting can be changed by calling `console.setPretty(true)` or `console.setPretty(false)`.

When enabled, the console will print the output with ANSII colors in the log labels, error messages,
stack traces and object representations.

## console.setMaxDepth(number)

By default this is set to 0, which means no limit.

This settings determines, when printing an object, how deep the object should be printed. If the
object is nested deeper than the specified depth, the output will be truncated.

## console.mapStackTrace(string)

The stack traces of all errors will contain only paths to the bundle file, making it hard to debug.
So when printing, the console will use the source maps (if enabled) to map each line of
the error stack traces to the corresponding source file.

This function allows you to do that same mapping manually, without printing it out. This can be useful
when you want to save that trace to a log file or send ir to a Monitoring Service like DataDog, Sentry, etc.

## console.formatStackTrace(string)

This function will format the stack trace in the same manner as if it was printed to the console. It
will add the ANSII coloring if the pretty setting is enabled.

## console.format(any)

This function will format the object in the same manner as if it was printed to the console and return it
as a string. It respects the same settings as all the printing functions (like setPretty or setMaxDepth.)

## console.onLogPrinted(Callback)

This function allows you to listen to all the logs that are printed to the console. This is an alternative to
overriding the console.log function. Note however that this will not capture logs that are emitted outside
of the application code and it's dependencies. If you want to capture all logs, you should look into the
`GLib.log_set_writer_func` function. (note 2: GLib logging is used by React GTK only in the production mode.)
