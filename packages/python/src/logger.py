import json
import requests
from datetime import datetime
from typing import List, Dict, Any


class Logger:
    MAX_RETRIES = 3
    COLORS = {
        "red": "\033[31m",
        "green": "\033[32m",
        "yellow": "\033[33m",
        "blue": "\033[34m",
        "magenta": "\033[35m",
        "cyan": "\033[36m",
        "white": "\033[37m",
        "black": "\033[30m",
        "reset": "\033[0m",
        "bgRed": "\033[41m",
        "bgGreen": "\033[42m",
        "bgYellow": "\033[43m",
        "bgBlue": "\033[44m",
        "bgMagenta": "\033[45m",
        "bgCyan": "\033[46m",
        "bgWhite": "\033[47m",
    }

    def __init__(self, config: Dict[str, Any]):
        if "backendUrl" not in config:
            raise ValueError("backendUrl property is required")
        self.backend_url = config["backendUrl"].rstrip("/")
        self.buffer_size = config.get("bufferSize", 10)
        if self.buffer_size <= 0:
            raise ValueError("bufferSize must be greater than 0")
        self.server_id = config["serverId"]
        self.buffer = []
        self.is_flushing = False
        self.queue = []
        self.number_of_retries_to_fetch = 0

    @staticmethod
    def format_message(*messages: Any) -> str:
        return " ".join(map(str, messages))

    @staticmethod
    def get_caller_info() -> str:
        import traceback

        stack = traceback.extract_stack()
        if len(stack) > 3:
            frame = stack[-4]
            return f"{frame.filename}:{frame.lineno}"
        return "unknown"

    def debug(self, *messages: Any):
        message = self.format_message(*messages)
        source = self.get_caller_info()
        print(
            f"{self.COLORS['bgWhite']}{self.COLORS['black']}[ DEBUG ]{self.COLORS['reset']} {message}"
        )
        self.push_log(
            {
                "level": "debug",
                "message": message,
                "source": source,
                "timestamp": datetime.now(),
            }
        )

    def info(self, *messages: Any):
        message = self.format_message(*messages)
        source = self.get_caller_info()
        print(f"{self.COLORS['bgBlue']}[ INFO ]{self.COLORS['reset']} {message}")
        self.push_log(
            {
                "level": "info",
                "message": message,
                "source": source,
                "timestamp": datetime.now(),
            }
        )

    def warn(self, *messages: Any):
        message = self.format_message(*messages)
        source = self.get_caller_info()
        print(f"{self.COLORS['bgYellow']}[ WARN ]{self.COLORS['reset']} {message}")
        self.send_log_immediately(
            {
                "level": "warn",
                "message": message,
                "source": source,
                "timestamp": datetime.now(),
            }
        )

    def error(self, *messages: Any):
        message = self.format_message(*messages)
        source = self.get_caller_info()
        print(f"{self.COLORS['bgRed']}[ ERROR ]{self.COLORS['reset']} {message}")
        self.send_log_immediately(
            {
                "level": "error",
                "message": message,
                "source": source,
                "timestamp": datetime.now(),
            }
        )

    def fatal(self, *messages: Any):
        message = self.format_message(*messages)
        source = self.get_caller_info()
        print(f"{self.COLORS['red']}[ FATAL ]{self.COLORS['reset']} {message}")
        self.send_log_immediately(
            {
                "level": "fatal",
                "message": message,
                "source": source,
                "timestamp": datetime.now(),
            }
        )

    def push_log(self, log: Dict[str, Any]):
        log["serverId"] = self.server_id
        self.buffer.append(log)
        if len(self.buffer) >= self.buffer_size:
            self.flush()

    def send_log_immediately(self, log: Dict[str, Any]):
        log["serverId"] = self.server_id
        log["timestamp"] = log[
            "timestamp"
        ].isoformat()  # Convert datetime to ISO format string
        try:
            response = requests.post(
                f"{self.backend_url}/logs",
                headers={"Content-Type": "application/json"},
                data=json.dumps([log]),
            )
            response.raise_for_status()
        except requests.RequestException as error:
            print(f"Failed to send log: {error}")

    def flush(self):
        if self.is_flushing:
            return
        self.is_flushing = True
        try:
            while self.buffer:
                logs_to_send = self.buffer[: self.buffer_size]
                self.buffer = self.buffer[self.buffer_size :]
                for log in logs_to_send:
                    log["timestamp"] = log[
                        "timestamp"
                    ].isoformat()  # Convert datetime to ISO format string
                try:
                    response = requests.post(
                        f"{self.backend_url}/logs",
                        headers={"Content-Type": "application/json"},
                        data=json.dumps(logs_to_send),
                    )
                    response.raise_for_status()
                except requests.RequestException as error:
                    print(f"Failed to send logs: {error}")
                    self.buffer.extend(logs_to_send)
                    break
        except Exception as error:
            print(f"Failed to send logs: {error}")
            if self.number_of_retries_to_fetch < self.MAX_RETRIES:
                self.queue.extend(self.buffer)
                self.number_of_retries_to_fetch += 1
            else:
                print("Failed to send logs after multiple retries")
        finally:
            self.is_flushing = False
            if self.queue:
                self.buffer.extend(self.queue)
                self.queue = []
                self.flush()
