# Verification Notes

Desktop route screenshots on 2026-08-21 exposed a runtime error after introducing the route switch: Wouter's router context was unavailable, causing `useRouter` to read a null context. The application needs an explicit router provider around the route switch before visual verification can continue.
