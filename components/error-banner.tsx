import { AnimatePresence, motion } from "motion/react";

export default function ErrorBanner(props: { error: Error }) {
  console.error("[ERROR]", props.error);
  return (
    <AnimatePresence>
      {props.error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          exit={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "tween" }}
          className="bg-destructive/10 overflow-x-scroll rounded-sm border border-destructive/10 p-1"
        >
          <small>{props.error.message}</small>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
