import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CourseTest from "./CourseTest";

interface TestDialogProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TestDialog = ({ courseId, isOpen, onClose }: TestDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Course Test</DialogTitle>
        </DialogHeader>
        <CourseTest courseId={courseId} onComplete={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default TestDialog;